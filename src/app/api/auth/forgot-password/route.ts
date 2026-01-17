import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return new NextResponse("Email is required", { status: 400 });
        }

        const user = await db.user.findUnique({
            where: { email },
        });

        // We don't want to reveal if a user exists or not for security,
        // so we return success even if user not found.
        if (!user) {
            return NextResponse.json({ success: true });
        }

        const token = uuidv4();
        const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

        await db.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
            },
        });

        await sendPasswordResetEmail(email, token);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[FORGOT_PASSWORD_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
