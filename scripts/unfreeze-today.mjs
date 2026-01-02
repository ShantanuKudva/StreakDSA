import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userId = "ac6dc2f3-bf68-47d4-bcfb-3250c073360f";

  // Find logs where isFrozen is true
  const logs = await prisma.dailyLog.findMany({
    where: {
      userId,
      isFrozen: true,
    },
  });

  console.log("Frozen logs count:", logs.length);
  for (const log of logs) {
    console.log(
      `- ID: ${log.id}, Date: ${log.date.toISOString()}, isFrozen: ${
        log.isFrozen
      }, completed: ${log.completed}`
    );
  }

  // Delete them or update them?
  // Let's delete them for a clean test.
  const deleteResult = await prisma.dailyLog.deleteMany({
    where: {
      userId,
      isFrozen: true,
      completed: false, // Only delete if they haven't completed a problem
    },
  });

  console.log(`Deleted ${deleteResult.count} frozen logs.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
