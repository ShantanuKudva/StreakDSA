import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTodayForUser } from "@/lib/date-utils";
import { toZonedTime } from "date-fns-tz";
import { sendStreakReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// Fixed reminder hours (in user's local timezone)
const REMINDER_HOURS = [12, 18, 21, 23]; // 12 PM, 6 PM, 9 PM, 11 PM

// Different messages for each time slot
const REMINDER_MESSAGES: Record<number, { emoji: string; urgency: string }> = {
  12: { emoji: "☀️", urgency: "gentle" },
  18: { emoji: "🌅", urgency: "reminder" },
  21: { emoji: "⏰", urgency: "urgent" },
  23: { emoji: "🚨", urgency: "final" },
};

// Vercel Cron will call this endpoint every hour
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Get all users with email notifications enabled and active pledge
    const users = await db.user.findMany({
      where: {
        pledgeDays: { gt: 0 },
        emailNotifications: true,
        email: { not: undefined },
      },
      select: {
        id: true,
        email: true,
        name: true,
        timezone: true,
        currentStreak: true,
      },
    });

    const results = [];

    for (const user of users) {
      if (!user.email) continue;

      // Get current hour in user's timezone
      const now = new Date();
      const zonedNow = toZonedTime(now, user.timezone || "UTC");
      const currentHour = zonedNow.getHours();

      // Check if current hour is a reminder hour
      if (!REMINDER_HOURS.includes(currentHour)) {
        results.push({
          email: user.email,
          status: "skipped",
          reason: `Hour ${currentHour} not in schedule`,
        });
        continue;
      }

      // Check if user has already completed today's log
      const today = getTodayForUser(user.timezone || "UTC");
      const dailyLog = await db.dailyLog.findUnique({
        where: { userId_date: { userId: user.id, date: today } },
      });

      if (dailyLog?.completed) {
        results.push({ email: user.email, status: "already_completed" });
        continue;
      }

      // Check if streak is frozen
      if (dailyLog?.isFrozen) {
        results.push({ email: user.email, status: "frozen" });
        continue;
      }

      // Send reminder email
      try {
        await sendStreakReminderEmail(
          user.email,
          user.name || "there",
          user.currentStreak
        );
        results.push({
          email: user.email,
          status: "sent",
          hour: currentHour,
          urgency: REMINDER_MESSAGES[currentHour]?.urgency,
        });
      } catch (error) {
        console.error(`Failed to send to ${user.email}:`, error);
        results.push({ email: user.email, status: "error" });
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
