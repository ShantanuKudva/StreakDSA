import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        // Find the token
        const verificationToken = await db.verificationToken.findUnique({
            where: { token },
        });

        if (!verificationToken) {
            return new NextResponse("Invalid token", { status: 400 });
        }

        // Check expiration
        if (new Date() > verificationToken.expires) {
            await db.verificationToken.delete({ where: { token } }); // Cleanup
            return new NextResponse("Token expired", { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user
        await db.user.update({
            where: { email: verificationToken.identifier },
            data: { password: hashedPassword },
        });

        // Delete used token
        await db.verificationToken.delete({
            where: { token },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[RESET_PASSWORD_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
