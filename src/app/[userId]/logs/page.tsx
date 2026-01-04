import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProblemLog } from "@prisma/client";
import { LogsClient } from "./logs-client";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function UserLogsPage({ params }: Props) {
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
    // Fetch all user logs
    const logs = await db.dailyLog.findMany({
      where: { userId: session.user.id },
      include: {
        problems: true,
      },
      orderBy: { date: "desc" },
    });

    return (
      <LogsClient
        userId={session.user.id}
        logs={logs.map((log) => ({
          id: log.id,
          date: log.date.toISOString(),
          completed: log.completed,
          problems: log.problems.map((p: ProblemLog) => ({
            id: p.id,
            name: p.name,
            topic: p.topic || "OTHER",
            difficulty: p.difficulty,
            externalUrl: p.externalUrl,
            tags: p.tags,
            notes: p.notes,
          })),
        }))}
      />
    );
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-4xl">⚠️</div>
          <h1 className="text-xl font-bold">Unable to load logs</h1>
          <p className="text-muted-foreground text-sm">
            We couldn&apos;t connect to the database. Please check your
            connection and try again.
          </p>
          <a
            href={`/${userId}/logs`}
            className="inline-block mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            Retry
          </a>
        </div>
      </div>
    );
  }
}
