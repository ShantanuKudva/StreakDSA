import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = "shantanu.kudva@nivettisystems.in";
    console.log(`Looking for user: ${email}...`);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log("User not found.");
        return;
    }

    console.log(`Found user: ${user.id} (${user.name}). Deleting...`);

    await prisma.user.delete({ where: { email } });
    console.log("User deleted successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
