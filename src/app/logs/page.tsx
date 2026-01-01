import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { LogsClient } from "./logs-client";

export default async function LogsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
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
      logs={logs.map((log) => ({
        id: log.id,
        date: log.date.toISOString(),
        completed: log.completed,
        problems: log.problems.map((p) => ({
          id: p.id,
          name: p.name,
          topic: p.topic,
          difficulty: p.difficulty,
          externalUrl: p.externalUrl,
          tags: p.tags,
          notes: p.notes,
        })),
      }))}
    />
  );
}
