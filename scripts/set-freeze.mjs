import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userId = "ac6dc2f3-bf68-47d4-bcfb-3250c073360f";

  // Get today's date at UTC midnight
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  );

  console.log("Setting freeze for date:", today.toISOString());

  // Upsert today's log with isFrozen: true
  const result = await prisma.dailyLog.upsert({
    where: { userId_date: { userId, date: today } },
    update: { isFrozen: true, completed: false },
    create: { userId, date: today, isFrozen: true, completed: false },
  });

  console.log("Freeze set! Log:", result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
