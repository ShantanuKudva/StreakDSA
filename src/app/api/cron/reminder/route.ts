import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTodayForUser } from "@/lib/date-utils";
import { toZonedTime } from "date-fns-tz";
import { subDays, differenceInCalendarDays } from "date-fns";
import {
  sendStreakReminderEmail,
  ReminderType,
  sendMilestoneEmail,
  sendPledgeCompletedEmail,
  sendStreakLostEmail,
  sendMotivationalEmail,
} from "@/lib/email";
import * as webpush from "web-push";

export const dynamic = "force-dynamic";

// Fixed reminder hours (in user's local timezone)
const REMINDER_SLOTS = [12, 18, 21, 23];

// Milestones to celebrate
const MILESTONES = [7, 14, 21, 30, 50, 75, 100, 150, 200, 365];

// Different messages for each time slot
const REMINDER_MESSAGES: Record<number, { emoji: string; urgency: ReminderType }> = {
  12: { emoji: "☀️", urgency: "gentle" },
  18: { emoji: "🌅", urgency: "reminder" },
  21: { emoji: "⏰", urgency: "urgent" },
  23: { emoji: "🚨", urgency: "final" },
};

/**
 * Unified Hourly Cron Job (Timezone Aware)
 * 
 * Runs every hour (UTC) but checks each user's LOCAL time to trigger:
 * - Reminders at 12 PM, 6 PM, 9 PM, 11 PM (user's timezone)
 * - Midnight events (streak lost, milestone, pledge) at 12 AM (user's timezone)
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Configure WebPush
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (vapidPublicKey && vapidPrivateKey) {
      try {
        webpush.setVapidDetails(
          `mailto:${process.env.NEXT_PUBLIC_VAPID_SUBJECT || "support@streakdsa.com"}`,
          vapidPublicKey,
          vapidPrivateKey
        );
      } catch (e) {
        console.error("Failed to setup WebPush", e);
      }
    }

    // Get all users with notifications enabled
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users = await (db.user as any).findMany({
      where: {
        pledgeDays: { gt: 0 },
        OR: [
          { emailNotifications: true, email: { not: undefined } },
          { pushNotifications: true, pushSubscriptions: { some: {} } },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        timezone: true,
        currentStreak: true,
        pledgeDays: true,
        lastReminderSentAt: true,
        lastMidnightProcessedAt: true,
        emailNotifications: true,
        pushNotifications: true,
        pushSubscriptions: true,
      },
    });

    const results = {
      reminders: [] as string[],
      streakLost: [] as string[],
      milestones: [] as { email: string; days: number }[],
      pledgeComplete: [] as string[],
    };

    for (const user of users) {
      if (!user.email) continue;

      const timezone = user.timezone || "UTC";
      const now = new Date();
      const zonedNow = toZonedTime(now, timezone);
      const currentHour = zonedNow.getHours();
      const today = getTodayForUser(timezone);

      // =============================================
      // MIDNIGHT EVENTS (when user's local hour is 0)
      // =============================================
      if (currentHour === 0) {
        // Check if we already processed midnight today
        if (user.lastMidnightProcessedAt) {
          const lastProcessedZoned = toZonedTime(user.lastMidnightProcessedAt, timezone);
          const isSameDay =
            zonedNow.getFullYear() === lastProcessedZoned.getFullYear() &&
            zonedNow.getMonth() === lastProcessedZoned.getMonth() &&
            zonedNow.getDate() === lastProcessedZoned.getDate();

          if (isSameDay) continue; // Already processed
        }

        const yesterday = subDays(today, 1);
        const yesterdayLog = await db.dailyLog.findUnique({
          where: { userId_date: { userId: user.id, date: yesterday } },
        });

        const wasActive = yesterdayLog?.completed || yesterdayLog?.isFrozen;

        // 1. STREAK LOST
        if (!wasActive && user.currentStreak > 0) {
          const logs = await db.dailyLog.findMany({
            where: {
              userId: user.id,
              OR: [{ completed: true }, { isFrozen: true }],
            },
            orderBy: { date: "desc" },
            take: 1,
          });

          if (logs.length > 0) {
            const daysSinceLastLog = differenceInCalendarDays(today, logs[0].date);
            if (daysSinceLastLog > 1) {
              const previousStreak = user.currentStreak;

              await db.user.update({
                where: { id: user.id },
                data: { currentStreak: 0, lastMidnightProcessedAt: new Date() },
              });

              if (user.emailNotifications) {
                try {
                  await sendStreakLostEmail(user.email, user.name || "there", previousStreak);
                  results.streakLost.push(user.email);
                } catch (e) {
                  console.error(`Failed to send streak lost email to ${user.email}`, e);
                }
              }
              continue;
            }
          }
        }

        // 2. MILESTONE
        if (MILESTONES.includes(user.currentStreak)) {
          const prevStreak = user.currentStreak - 1;
          if (!MILESTONES.includes(prevStreak)) {
            if (user.emailNotifications) {
              try {
                await sendMilestoneEmail(user.email, user.name || "Champion", user.currentStreak);
                results.milestones.push({ email: user.email, days: user.currentStreak });
              } catch (e) {
                console.error(`Failed to send milestone email to ${user.email}`, e);
              }
            }
          }
        }

        // 3. PLEDGE COMPLETED
        if (user.currentStreak > 0 && user.currentStreak === user.pledgeDays) {
          if (user.emailNotifications) {
            try {
              await sendPledgeCompletedEmail(user.email, user.name || "Champion", user.pledgeDays);
              results.pledgeComplete.push(user.email);
            } catch (e) {
              console.error(`Failed to send pledge complete email to ${user.email}`, e);
            }
          }
        }

        // Mark midnight as processed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db.user as any).update({
          where: { id: user.id },
          data: { lastMidnightProcessedAt: new Date() },
        });

        continue; // Skip reminder check at midnight hour
      }

      // =============================================
      // REMINDER NOTIFICATIONS (12, 18, 21, 23 hours)
      // =============================================
      const targetSlot = [...REMINDER_SLOTS].reverse().find((s) => currentHour >= s);

      if (!targetSlot) continue; // Too early

      // Check duplicate
      if (user.lastReminderSentAt) {
        const lastSentZoned = toZonedTime(user.lastReminderSentAt, timezone);
        const isSameDay =
          zonedNow.getFullYear() === lastSentZoned.getFullYear() &&
          zonedNow.getMonth() === lastSentZoned.getMonth() &&
          zonedNow.getDate() === lastSentZoned.getDate();

        if (isSameDay && lastSentZoned.getHours() >= targetSlot) continue;
      }

      // Check if user already completed today
      const dailyLog = await db.dailyLog.findUnique({
        where: { userId_date: { userId: user.id, date: today } },
      });

      if (dailyLog?.completed || dailyLog?.isFrozen) continue;

      // For users with 0 streak: send one motivational email per day (only at first slot)
      if (user.currentStreak === 0) {
        // Only send at first reminder slot (12 PM) to limit to once per day
        if (targetSlot !== REMINDER_SLOTS[0]) continue;

        // Check if already sent today
        if (user.lastReminderSentAt) {
          const lastSentZoned = toZonedTime(user.lastReminderSentAt, timezone);
          const isSameDay =
            zonedNow.getFullYear() === lastSentZoned.getFullYear() &&
            zonedNow.getMonth() === lastSentZoned.getMonth() &&
            zonedNow.getDate() === lastSentZoned.getDate();
          if (isSameDay) continue;
        }

        if (user.emailNotifications && user.email) {
          try {
            await sendMotivationalEmail(user.email, user.name || "there");
            await (db.user as any).update({
              where: { id: user.id },
              data: { lastReminderSentAt: new Date() },
            });
            results.reminders.push(user.email);
          } catch (e) {
            console.error(`Motivational email failed for ${user.email}`, e);
          }
        }
        continue;
      }

      const messageConfig = REMINDER_MESSAGES[targetSlot] || { emoji: "🔥", urgency: "reminder" };
      const urgency = messageConfig.urgency;
      const emoji = messageConfig.emoji;

      let sentEmail = false;
      let sentPush = false;

      // Send Email
      if (user.emailNotifications && user.email) {
        try {
          await sendStreakReminderEmail(user.email, user.name || "there", user.currentStreak, urgency);
          sentEmail = true;
        } catch (e) {
          console.error(`Email failed for ${user.email}`, e);
        }
      }

      // Send Push
      if (user.pushNotifications && user.pushSubscriptions.length > 0 && vapidPublicKey && vapidPrivateKey) {
        const pushContent = {
          title: `${emoji} Streak Reminder`,
          body: `Don't break your ${user.currentStreak}-day streak! Check in now.`,
          url: "/dashboard",
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const promises = user.pushSubscriptions.map((sub: any) => {
          const subscription = {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          };

          return webpush.sendNotification(subscription, JSON.stringify(pushContent)).catch((err) => {
            if (err.statusCode === 410 || err.statusCode === 404) {
              return db.pushSubscription.delete({ where: { id: sub.id } });
            }
            console.error("Push failed", err);
          });
        });

        await Promise.all(promises);
        sentPush = true;
      }

      if (sentEmail || sentPush) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db.user as any).update({
          where: { id: user.id },
          data: { lastReminderSentAt: new Date() },
        });

        results.reminders.push(user.email);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      usersProcessed: users.length,
      results,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
