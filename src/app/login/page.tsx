"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Flame, Target, Gem, Github, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/onboard/check",
    });
    setIsLoading(false);
  };

  const getErrorMessage = (
    errorCode: string | null
  ): { message: string; action?: "register" } | null => {
    if (!errorCode) return null;

    switch (errorCode) {
      case "OAuthAccountNotLinked":
      case "OAuthConflict":
        return {
          message:
            "This email is already registered with a different sign-in method. Please use Google or GitHub.",
        };
      case "UserNotFound":
        return {
          message:
            "No account found with this email. Create one to get started!",
          action: "register",
        };
      case "InvalidPassword":
        return { message: "Incorrect password. Please try again." };
      case "NoPasswordSet":
        return {
          message:
            "This account doesn't have a password. Please use Google or GitHub.",
        };
      case "CredentialsSignin":
        return { message: "Sign in failed. Please check your credentials." };
      default:
        return { message: "An error occurred. Please try again." };
    }
  };

  const errorInfo = getErrorMessage(error);

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

      {/* Error Alert */}
      {errorInfo && (
        <div className="w-full max-w-md mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-400">{errorInfo.message}</p>
            {errorInfo.action === "register" && (
              <a
                href="/register"
                className="inline-block mt-2 text-xs text-orange-400 hover:underline font-medium"
              >
                Create an account →
              </a>
            )}
            {!errorInfo.action && (
              <p className="text-xs text-slate-400 mt-1">
                Need help? Contact{" "}
                <a
                  href="mailto:kudvashantanu2002@gmail.com"
                  className="text-orange-400 hover:underline"
                >
                  kudvashantanu2002@gmail.com
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Login card */}
      <Card className="w-full max-w-md border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to continue your streak</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OAuth Buttons */}
          <Button
            onClick={() => signIn("google", { callbackUrl: "/onboard/check" })}
            variant="outline"
            className="w-full h-11 text-base bg-white/5 border-slate-700 hover:bg-white/10 hover:text-white"
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

          <Button
            onClick={() => signIn("github", { callbackUrl: "/onboard/check" })}
            variant="outline"
            className="w-full h-11 text-base bg-white/5 border-slate-700 hover:bg-white/10 hover:text-white"
          >
            <Github className="mr-2 h-5 w-5" />
            Continue with GitHub
          </Button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-950 px-2 text-slate-500">
                Or sign in with email
              </span>
            </div>
          </div>

          {/* Email/Password Form Toggle */}
          {!showEmailForm ? (
            <Button
              onClick={() => setShowEmailForm(true)}
              variant="ghost"
              className="w-full h-11 text-base hover:bg-white/5 hover:text-white"
            >
              <Mail className="mr-2 h-5 w-5" />
              Use Email & Password
            </Button>
          ) : (
            <form
              onSubmit={handleCredentialsLogin}
              className="space-y-4 animate-in fade-in slide-in-from-top-2"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-900 border-slate-800 focus:border-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-900 border-slate-800 focus:border-orange-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-xs hover:bg-transparent hover:text-orange-400"
                onClick={() => setShowEmailForm(false)}
              >
                Back to other options
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* New User Option */}
      <div className="mt-6 text-center">
        <p className="text-slate-400 text-sm">
          New to StreakDSA?{" "}
          <a
            href="/register"
            className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
          >
            Create an account
          </a>
        </p>
      </div>

      <div className="mt-8 flex gap-4 text-xs text-slate-600">
        <a href="/terms" className="hover:text-slate-400 transition-colors">
          Terms of Service
        </a>
        <a href="/privacy" className="hover:text-slate-400 transition-colors">
          Privacy Policy
        </a>
      </div>
    </div>
  );
}
