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
}
