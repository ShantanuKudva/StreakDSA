import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";
import { DashboardClient } from "./dashboard-client";
import { UserNotOnboardedError } from "@/lib/errors";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    const dashboardData = await getDashboardData(session.user.id);
    return <DashboardClient data={dashboardData} />;
  } catch (error) {
    if (error instanceof UserNotOnboardedError) {
      redirect("/onboard");
    }
    throw error;
  }
}
