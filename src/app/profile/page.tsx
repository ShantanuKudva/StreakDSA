import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDashboardData } from "@/lib/data";
import { Suspense } from "react";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
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

  // Use getDashboardData to get unified activity and heatmap data
  const dashboardData = await getDashboardData(session.user.id);

  const stats = {
    totalProblems,
    byDifficulty: problemStats.map((s) => ({
      difficulty: s.difficulty,
      count: s._count,
    })),
    byTopic: topicStats.map((s) => ({
      topic: s.topic || "OTHER",
      count: s._count,
    })),
  };

  return (
    <Suspense fallback={<ProfileSkeleton />}>
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
        stats={stats}
        heatmapDays={dashboardData.heatmapDays}
        activityData={dashboardData.activityData}
        timeDistribution={dashboardData.timeDistribution}
        freezeCount={dashboardData.freezeCount}
      />
    </Suspense>
  );
}
