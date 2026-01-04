"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Flame, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OnboardCheckPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checkStatus, setCheckStatus] = useState<
    "loading" | "new" | "partial" | "complete"
  >("loading");

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.id) {
      router.replace("/login");
      return;
    }

    const userId = session.user.id;

    // Check onboarding status
    if (session.user?.isOnboarded) {
      setCheckStatus("complete");
      // Auto-redirect after delay
      setTimeout(() => {
        router.replace(`/${userId}/dashboard`);
      }, 1500);
    } else {
      // User needs onboarding
      setCheckStatus("new");
      setTimeout(() => {
        router.replace(`/${userId}/onboard`);
      }, 1500);
    }
  }, [session, status, router]);

  const userId = session?.user?.id;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Logo */}
        <div className="inline-flex items-center justify-center p-4 bg-orange-500/10 rounded-full ring-1 ring-orange-500/20 mb-4">
          <Flame className="h-12 w-12 text-orange-500" />
        </div>

        {checkStatus === "loading" && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
            <p className="text-slate-400">Checking your account status...</p>
          </>
        )}

        {checkStatus === "complete" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
            <h1 className="text-2xl font-bold text-white">Welcome Back!</h1>
            <p className="text-slate-400">
              You&apos;re already registered. Redirecting you to your
              dashboard...
            </p>
            <Button
              onClick={() => router.replace(`/${userId}/dashboard`)}
              variant="outline"
              className="mt-4"
            >
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {checkStatus === "new" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h1 className="text-2xl font-bold text-white">
              Let&apos;s Get Started!
            </h1>
            <p className="text-slate-400">
              Setting up your commitment journey...
            </p>
            <Loader2 className="h-6 w-6 animate-spin text-orange-500 mx-auto" />
          </div>
        )}

        {checkStatus === "partial" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h1 className="text-2xl font-bold text-white">Continue Setup</h1>
            <p className="text-slate-400">
              You started onboarding before. Let&apos;s pick up where you left
              off.
            </p>
            <Button
              onClick={() => router.replace(`/${userId}/onboard`)}
              className="mt-4"
            >
              Continue Onboarding <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
