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
      httpOptions: {
        timeout: 10000,
      },
      allowDangerousEmailAccountLinking: true,
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
    strategy: "jwt", // Use JWT strategy to support Credentials provider
    maxAge: 30 * 60, // 30 minutes
    updateAge: 15 * 60, // 15 minutes
  },
  pages: {
    signIn: "/login",
    newUser: "/onboard",
    error: "/login", // Redirect to login on error
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;

      if (!user.email) return false;

      // Check if user exists
      const existingUser = await db.user.findUnique({
        where: { email: user.email },
        include: { accounts: true },
      });

      if (existingUser) {
        const isLinkedToProvider = existingUser.accounts.some(
          (acc) => acc.provider === account?.provider
        );

        if (!isLinkedToProvider) {
          // Block automatic account creation if email exists with different provider
          return false;
          // Or return `/login?error=OAuthAccountNotLinked`
        }
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // First time login/sign up
      if (user) {
        // Explicitly extract only needed fields to avoid giant objects (like base64 images)
        // from bloating the session cookie to 4.5MB+
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          // Only store image if it's a reasonably sized URL, not a giant data URI
          picture: user.image && user.image.length < 2000 ? user.image : null,
          isOnboarded: ((user as unknown as { pledgeDays?: number }).pledgeDays ?? 0) > 0,
        };
      }

      // Handle session update (e.g. after onboarding)
      if (trigger === "update" && session?.isOnboarded !== undefined) {
        token.isOnboarded = session.isOnboarded;
      }

      // Ensure we always return a clean token
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.isOnboarded = !!token.isOnboarded;
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
  debug: false,
};
