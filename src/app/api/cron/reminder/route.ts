import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendStreakReminder } from "@/lib/notifications";
import { getTodayForUser } from "@/lib/date-utils";
import { toZonedTime } from "date-fns-tz";

// Vercel Cron will call this endpoint
export async function GET(req: NextRequest) {
  // Verify cron secret if needed (optional for now, but good practice)
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 1. Get all users who have a pledge
    const users = await db.user.findMany({
      where: {
        pledgeDays: { gt: 0 },
        email: { not: undefined }, // Ensure email exists
      },
    });

    const results = [];

    for (const user of users) {
      if (!user.email) continue;

      // 2. Check if they have completed today's log
      const today = getTodayForUser(user.timezone);
      const dailyLog = await db.dailyLog.findUnique({
        where: { userId_date: { userId: user.id, date: today } },
      });

      if (dailyLog?.completed) {
        results.push({ email: user.email, status: "completed" });
        continue;
      }

      // 3. Check if it's time to remind
      // We want to send reminder if current time >= reminderTime
      // And ideally, we haven't sent one yet today (need to track this? For now, just send if close)
      // Simpler approach for MVP:
      // Cron runs every hour.
      // Check if current hour in user's timezone == reminder hour.
      
      const now = new Date();
      const zonedNow = toZonedTime(now, user.timezone);
      const currentHour = zonedNow.getHours();
      
      const [reminderHour] = user.reminderTime.split(":").map(Number);

      if (currentHour === reminderHour) {
        await sendStreakReminder(user.email, user.name || "User");
        results.push({ email: user.email, status: "sent" });
      } else {
        results.push({ 
          email: user.email, 
          status: "skipped", 
          reason: `Current hour ${currentHour} != Reminder hour ${reminderHour}` 
        });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Cron error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
