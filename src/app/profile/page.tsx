import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      pledgeDays: true,
      startDate: true,
      reminderTime: true,
      timezone: true,
      currentStreak: true,
      maxStreak: true,
      daysCompleted: true,
      gems: true,
      createdAt: true,
    },
  });

  if (!user || !user.pledgeDays) {
    redirect("/onboard");
  }

  // Get problem stats
  const problemStats = await db.problemLog.groupBy({
    by: ["difficulty"],
    where: {
      dailyLog: { userId: session.user.id },
    },
    _count: true,
  });

  const topicStats = await db.problemLog.groupBy({
    by: ["topic"],
    where: {
      dailyLog: { userId: session.user.id },
    },
    _count: true,
  });

  const totalProblems = await db.problemLog.count({
    where: {
      dailyLog: { userId: session.user.id },
    },
  });

  // Fetch heatmap data for profile (e.g. current month or year)
  // Reusing the same helper logic or just fetching logs
  // Since we want "Activity", let's show the same heatmap as dashboard (current month view).
  // Ideally, we import getMonthHeatmap from a shared util if available, or copy logic.
  // The dashboard uses:
  /*
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    const logs = await db.dailyLog.findMany...
  */
  // But wait, the Heatmap component expects `days: { date: string, completed: boolean }[]`.
  // Let's implement the fetching here.

  // Last 12 months for heatmap
  const today = new Date();
  const {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    format,
    isSameDay,
    subMonths,
  } = await import("date-fns");

  const start = startOfMonth(subMonths(today, 11)); // Start from 11 months ago
  const end = endOfMonth(today);

  const logs = await db.dailyLog.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: start,
        lte: end,
      },
      completed: true,
    },
  });

  const heatmapDays = eachDayOfInterval({ start, end }).map((date) => {
    const isCompleted = logs.some((log: { date: Date }) =>
      isSameDay(log.date, date)
    );
    return {
      date: format(date, "yyyy-MM-dd"), // Heatmap expects string
      completed: isCompleted,
      isMilestone: false,
    };
  });

  return (
    <ProfileClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        pledgeDays: user.pledgeDays,
        startDate: user.startDate?.toISOString() || "",
        reminderTime: user.reminderTime,
        timezone: user.timezone,
        currentStreak: user.currentStreak,
        maxStreak: user.maxStreak,
        daysCompleted: user.daysCompleted,
        gems: user.gems,
        createdAt: user.createdAt.toISOString(),
      }}
      stats={{
        totalProblems,
        byDifficulty: problemStats.map(
          (s: { difficulty: string; _count: number }) => ({
            difficulty: s.difficulty,
            count: s._count,
          })
        ),
        byTopic: topicStats.map((s: { topic: string; _count: number }) => ({
          topic: s.topic,
          count: s._count,
        })),
      }}
      heatmapDays={heatmapDays}
    />
  );
}
