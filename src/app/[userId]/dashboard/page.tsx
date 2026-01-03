import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";
import { DashboardClient } from "../../dashboard-client";
import { UserNotOnboardedError } from "@/lib/errors";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function UserDashboardPage({ params }: Props) {
  const { userId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Validate userId matches logged-in user
  if (userId !== session.user.id) {
    notFound();
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
