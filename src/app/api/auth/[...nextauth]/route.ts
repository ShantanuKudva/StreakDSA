import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const handler = NextAuth(authOptions);

async function wrappedHandler(req: NextRequest, context: any) {
  // Check for required environment variables for Google provider
  if (req.nextUrl.pathname.includes("/signin/google")) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error("NextAuth Error: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing");
      return NextResponse.json(
        { error: "Authentication provider is not configured correctly" },
        { status: 500 }
      );
    }
  }
  
  return handler(req, context);
}

export { wrappedHandler as GET, wrappedHandler as POST };
