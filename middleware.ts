import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Check if accessing user-specific routes like /[userId]/dashboard
    const userRouteMatch = pathname.match(
      /^\/([^\/]+)\/(dashboard|profile|logs|onboard)/
    );

    if (userRouteMatch) {
      const urlUserId = userRouteMatch[1];
      const sessionUserId = token?.sub;

      // If userId in URL doesn't match session user, redirect to their own dashboard
      if (sessionUserId && urlUserId !== sessionUserId) {
        return NextResponse.redirect(
          new URL(`/${sessionUserId}/dashboard`, req.url)
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    // Protect user-specific routes
    "/:userId((?!api|_next|login|register|onboard|terms|privacy|favicon)[^/]+)/dashboard/:path*",
    "/:userId((?!api|_next|login|register|onboard|terms|privacy|favicon)[^/]+)/profile/:path*",
    "/:userId((?!api|_next|login|register|onboard|terms|privacy|favicon)[^/]+)/logs/:path*",
    "/:userId((?!api|_next|login|register|onboard|terms|privacy|favicon)[^/]+)/onboard/:path*",
    // Protect API routes (except auth)
    "/api/((?!auth).*)",
    // Keep legacy routes protected (redirect to new structure)
    "/dashboard/:path*",
    "/profile/:path*",
    "/logs/:path*",
    "/onboard/:path*",
  ],
};
