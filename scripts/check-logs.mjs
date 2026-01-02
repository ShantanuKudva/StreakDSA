import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userId = "ac6dc2f3-bf68-47d4-bcfb-3250c073360f";

  const logs = await prisma.dailyLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 5,
  });

  console.log("Recent logs for user:");
  for (const log of logs) {
    console.log(
      `- Date: ${log.date.toISOString()}, isFrozen: ${
        log.isFrozen
      }, completed: ${log.completed}`
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
