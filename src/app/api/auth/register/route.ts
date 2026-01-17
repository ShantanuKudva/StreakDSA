import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { z } from "zod";
import { sendVerificationEmail } from "@/lib/email";

const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
      include: { accounts: true },
    });

    if (existingUser) {
      // User exists with OAuth
      if (existingUser.accounts.length > 0) {
        const providers = existingUser.accounts
          .map((a) => a.provider)
          .join(", ");
        return NextResponse.json(
          {
            error: `An account with this email already exists. Please sign in with ${providers}.`,
          },
          { status: 409 }
        );
      }
      // User exists with password already
      if (existingUser.password) {
        return NextResponse.json(
          {
            error: "An account with this email already exists. Please sign in.",
          },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    if (existingUser) {
      // Update existing user with password (rare edge case)
      await db.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
      });
    } else {
      // Create new user
      await db.user.create({
        data: {
          email,
          password: hashedPassword,
          pledgeDays: 0,
          currentStreak: 0,
          maxStreak: 0,
          daysCompleted: 0,
          gems: 0,
          reminderTime: "22:00",
          timezone: "UTC",
        },
      });

      // Generate verification token
      const token = crypto.randomUUID();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Save verification token
      await db.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });

      // Send verification email
      try {
        await sendVerificationEmail(email, token);
      } catch (emailError) {
        console.error("Failed to send verification email during registration:", emailError);
        // Do not fail registration, user can request it later
      }
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful!",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
