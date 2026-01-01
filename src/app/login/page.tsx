"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Flame, Target, Gem } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Logo and tagline */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 text-4xl font-bold text-white">
          <Flame className="h-10 w-10 text-orange-500" />
          StreakDSA
        </div>
        <p className="mt-2 text-lg text-slate-300">
          Make skipping DSA psychologically harder than doing it
        </p>
      </div>

      {/* Login card */}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Start Your Journey</CardTitle>
          <CardDescription>
            Sign in to begin your DSA accountability pledge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            variant="outline"
            className="w-full h-12 text-base"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Features preview */}
          <div className="pt-6 border-t space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Target className="h-5 w-5 text-emerald-500" />
              <span>Set a pledge and commit to daily DSA</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Flame className="h-5 w-5 text-orange-500" />
              <span>Build streaks with harsh accountability</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Gem className="h-5 w-5 text-purple-500" />
              <span>Earn gems for consistency</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-slate-400">
        This is not a productivity app. This is a commitment enforcement system.
      </p>
    </div>
  );
}
