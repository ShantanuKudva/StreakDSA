import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { Topic, Difficulty } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDashboardData } from "@/lib/data";

import { ProfileClient } from "./profile-client";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function UserProfilePage({ params }: Props) {
  const { userId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Validate userId matches logged-in user
  if (userId !== session.user.id) {
    notFound();
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
      dailyProblemLimit: true,
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

  // Use getDashboardData to get unified activity and heatmap data
  const dashboardData = await getDashboardData(session.user.id);

  const stats = {
    totalProblems,
    byDifficulty: problemStats.map(
      (s: { difficulty: Difficulty; _count: number }) => ({
        difficulty: s.difficulty,
        count: s._count,
      })
    ),
    byTopic: topicStats.map((s: { topic: Topic | null; _count: number }) => ({
      topic: s.topic || "OTHER",
      count: s._count,
    })),
  };

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
        dailyProblemLimit: user.dailyProblemLimit,
      }}
      stats={stats}
      heatmapDays={dashboardData.heatmapDays}
      activityData={dashboardData.activityData}
      timeDistribution={dashboardData.timeDistribution}
      freezeCount={dashboardData.freezeCount}
    />
  );
}
