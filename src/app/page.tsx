import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Get user data
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      pledgeDays: true,
      startDate: true,
      reminderTime: true,
      timezone: true,
      currentStreak: true,
      maxStreak: true,
      daysCompleted: true,
      gems: true,
    },
  });

  // Redirect to onboard if not set up
  if (!user || !user.pledgeDays || user.pledgeDays === 0) {
    redirect("/onboard");
  }

  // Calculate derived data
  const today = new Date();
  const endDate = new Date(user.startDate!);
  endDate.setDate(endDate.getDate() + user.pledgeDays);
  const daysRemaining = Math.max(
    0,
    Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Get today's log
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  const todayLog = await db.dailyLog.findFirst({
    where: {
      userId: session.user.id,
      date: {
        gte: todayStart,
      },
    },
    include: { problems: true },
  });

  // Calculate deadline
  const [hours, minutes] = user.reminderTime.split(":").map(Number);
  const deadline = new Date(today);
  deadline.setHours(hours, minutes, 0, 0);

  // Get recent logs for heatmap
  const logs = await db.dailyLog.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "asc" },
    include: { problems: true },
  });

  const dashboardData = {
    user: {
      name: user.name,
      email: user.email!,
    },
    pledge: {
      totalDays: user.pledgeDays,
      daysCompleted: user.daysCompleted,
      daysRemaining,
      startDate: user.startDate!.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    },
    streak: {
      current: user.currentStreak,
      max: user.maxStreak,
    },
    gems: user.gems,
    today: {
      completed: todayLog?.completed ?? false,
      deadlineAt: deadline.toISOString(),
      problemsLogged: todayLog?.problems.length ?? 0,
      problems: (todayLog?.problems || []).map((p) => ({
        id: p.id,
        topic: p.topic,
        name: p.name,
        difficulty: p.difficulty,
        externalUrl: p.externalUrl,
        tags: p.tags,
        notes: p.notes,
      })),
    },
    heatmapDays: logs.map((log) => ({
      date: log.date.toISOString().split("T")[0],
      completed: log.completed,
      isMilestone: false, // Simplified for now
    })),
  };

  return <DashboardClient data={dashboardData} />;
}
