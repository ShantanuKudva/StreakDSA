import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const email = session.user.email;
        const user = await db.user.findUnique({
            where: { email },
            select: { emailVerified: true }
        });

        if (user?.emailVerified) {
            return NextResponse.json({ message: "Email already verified" }, { status: 400 });
        }

        // Generate secure token
        const token = crypto.randomUUID();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        // Save token to database
        // Requires standard NextAuth VerificationToken model
        await db.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
            },
        });

        // Send email
        const emailSent = await sendVerificationEmail(email, token);

        if (!emailSent) {
            throw new Error("Failed to send email");
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Send verification error:", error);
        return NextResponse.json(
            { error: "Failed to send verification email" },
            { status: 500 }
        );
    }
}
