import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Flame } from "lucide-react";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function UserOnboardPage({ params }: Props) {
  const { userId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Validate userId matches logged-in user
  if (userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] p-4 text-white font-sans selection:bg-orange-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20 backdrop-blur-sm shadow-[0_0_15px_rgba(249,115,22,0.1)]">
            <Flame className="w-8 h-8 text-orange-500 fill-orange-500/20" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            StreakDSA
          </h1>
        </div>

        {/* Wizard Component */}
        <OnboardingWizard />

        {/* Legal Footer */}
        <div className="mt-8 flex gap-4 text-xs text-slate-500 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <a
            href="/terms"
            target="_blank"
            className="hover:text-slate-300 transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="/privacy"
            target="_blank"
            className="hover:text-slate-300 transition-colors"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
