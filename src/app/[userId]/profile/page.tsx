import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { Topic, Difficulty } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDashboardData } from "@/lib/data";
import { unstable_cache } from "next/cache";

import { ProfileClient } from "./profile-client";

interface Props {
  params: Promise<{ userId: string }>;
}

// Cached function to fetch profile data
const getProfileData = unstable_cache(
  async (userId: string) => {
    const user = await db.user.findUnique({
      where: { id: userId },
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
      return null;
    }

    // Get problem stats
    const problemStats = await db.problemLog.groupBy({
      by: ["difficulty"],
      where: {
        dailyLog: { userId },
      },
      _count: true,
    });

    const topicStats = await db.problemLog.groupBy({
      by: ["topic"],
      where: {
        dailyLog: { userId },
      },
      _count: true,
    });

    const totalProblems = await db.problemLog.count({
      where: {
        dailyLog: { userId },
      },
    });

    const dashboardData = await getDashboardData(userId);

    return {
      user,
      problemStats,
      topicStats,
      totalProblems,
      dashboardData,
    };
  },
  ["profile-data"],
  { revalidate: 60, tags: ["profile"] } // Cache for 60 seconds, can be revalidated via tag
);

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

  try {
    const data = await getProfileData(session.user.id);

    if (!data) {
      redirect("/onboard");
    }

    const { user, problemStats, topicStats, totalProblems, dashboardData } =
      data;

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
          pledgeDays: user.pledgeDays!,
          startDate:
            typeof user.startDate === "string"
              ? user.startDate
              : user.startDate?.toISOString() || "",
          reminderTime: user.reminderTime,
          timezone: user.timezone,
          currentStreak: user.currentStreak,
          maxStreak: user.maxStreak,
          daysCompleted: user.daysCompleted,
          gems: user.gems,
          createdAt:
            typeof user.createdAt === "string"
              ? user.createdAt
              : user.createdAt.toISOString(),
          dailyProblemLimit: user.dailyProblemLimit,
        }}
        stats={stats}
        heatmapDays={dashboardData.heatmapDays}
        activityData={dashboardData.activityData}
        timeDistribution={dashboardData.timeDistribution}
        freezeCount={dashboardData.freezeCount}
      />
    );
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-4xl">⚠️</div>
          <h1 className="text-xl font-bold">Unable to load profile</h1>
          <p className="text-muted-foreground text-sm">
            We couldn&apos;t connect to the database. Please check your
            connection and try again.
          </p>
          <a
            href={`/${userId}/profile`}
            className="inline-block mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            Retry
          </a>
        </div>
      </div>
    );
  }
}
