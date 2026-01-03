/**
 * NextAuth.js configuration
 * Based on HLD Section 6.1 and LLD Section 3
 */

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("InvalidCredentials");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { accounts: true },
        });

        // User not found - they need to register
        if (!user) {
          throw new Error("UserNotFound");
        }

        // User exists but has OAuth accounts and no password
        if (!user.password && user.accounts.length > 0) {
          // Generic error - don't expose provider details in URL
          throw new Error("OAuthConflict");
        }

        // User exists but no password set (edge case - shouldn't happen normally)
        if (!user.password) {
          throw new Error("NoPasswordSet");
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("InvalidPassword");
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    newUser: "/onboard",
    error: "/login", // Redirect to login on error
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials") return true;

      if (!user.email) return false;

      // Check if user exists
      const existingUser = await db.user.findUnique({
        where: { email: user.email },
        include: { accounts: true },
      });

      if (existingUser) {
        // If user has no accounts (legacy/email password only) and trying to link OAuth -> Allow ??
        // OR if user has accounts but none match current provider -> BLOCK per requirements.

        const isLinkedToProvider = existingUser.accounts.some(
          (acc) => acc.provider === account?.provider
        );

        if (!isLinkedToProvider) {
          // Requirement: "Block automatic account creation... Show error state"
          // We return false or a URL to redirect to with error.
          // Returning generic string redirects to /login?error=<string>
          // But NextAuth handling of string return is specific.
          // Ideally we throw an error or return false.

          // However, if we want to allow "Linking" implicitly if the email is verified, we could set allowDangerousEmailAccountLinking: true
          // But the USER REQUEST says: "Case B: Different Auth Method Exists ... Block automatic account creation. Show error state"

          // So we must manually check and BLOCK if provider mismatch.
          // BUT `allowDangerousEmailAccountLinking: true` is required for PrismaAdapter to even ATTEMPT linking.
          // So we enable it in provider config, but BLOCK here in signIn callback.

          // Wait, if allowDangerousEmailAccountLinking is false (default), NextAuth automatically blocks it with "OAuthAccountNotLinked".
          // So actually we might NOT need custom logic if we just keep default behavior?
          // Default behavior: Sign in with Google (email=a@b.com). User exists with GitHub (email=a@b.com).
          // Result: Redirect to /login?error=OAuthAccountNotLinked

          // User request says: "Show error state: `An account with this email already exists...`"
          // The default error `OAuthAccountNotLinked` can be mapped to this message in UI.

          // So I will stick to default behavior (allowDangerousEmailAccountLinking: false) which is SAFER and matches requirement.
          // I will remove `allowDangerousEmailAccountLinking: true` from my code above.

          return true;
        }
      }

      return true;
    },
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
      // Handle relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Handle absolute URLs on same origin
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Default to onboard check
      return `${baseUrl}/onboard/check`;
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
