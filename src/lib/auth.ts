/**
 * NextAuth.js configuration
 * Based on HLD Section 6.1 and LLD Section 3
 */

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    newUser: "/onboard",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        // Check if user is onboarded (has pledgeDays set)
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { pledgeDays: true },
        });
        token.isOnboarded = (dbUser?.pledgeDays ?? 0) > 0;
      }

      // Handle session updates (e.g., after onboarding)
      if (trigger === "update" && session?.isOnboarded !== undefined) {
        token.isOnboarded = session.isOnboarded;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.isOnboarded = token.isOnboarded;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After sign in, redirect to onboard if not onboarded
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
  events: {
    async createUser({ user }) {
      // Initialize user with default values when created via OAuth
      await db.user.update({
        where: { id: user.id },
        data: {
          pledgeDays: 0, // Will be set during onboarding
          currentStreak: 0,
          maxStreak: 0,
          daysCompleted: 0,
          gems: 0,
          reminderTime: "22:00",
          timezone: "UTC",
        },
      });
    },
  },
};
