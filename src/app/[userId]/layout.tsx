import { AppHeader } from "@/components/layout/app-header";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ userId: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const resolvedParams = await params;
  const user = await db.user.findUnique({
    where: { id: resolvedParams.userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      gems: true,
      currentStreak: true,
      timezone: true,
      pledgeDays: true,
    },
  });

  if (!user) {
    redirect("/");
  }

  // Get today's date in user's timezone as YYYY-MM-DD
  const userTimezone = user.timezone || "Asia/Kolkata";
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: userTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayStr = formatter.format(now); // YYYY-MM-DD format

  // Parse as date at midnight UTC (to match how Prisma stores @db.Date)
  const todayDate = new Date(todayStr + "T00:00:00.000Z");

  const todayLog = await db.dailyLog.findFirst({
    where: {
      userId: user.id,
      date: todayDate,
      // Check for logs with at least one problem logged
      problems: {
        some: {},
      },
    },
  });

  const isOnboarded = (user.pledgeDays || 0) > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader
        user={user}
        gems={user.gems}
        currentStreak={user.currentStreak}
        hasTodayLog={!!todayLog}
        isOnboarded={isOnboarded}
      />
      {children}
    </div>
  );
}
