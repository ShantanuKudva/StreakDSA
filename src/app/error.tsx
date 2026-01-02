"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-red-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="relative z-10 max-w-md w-full">
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
          <div className="bg-gradient-to-br from-red-500/20 to-red-900/20 p-6 rounded-2xl mb-8 inline-block">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-white">
            System Error
          </h1>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
          We encountered an unexpected error. Don&apos;t worry, your streak is safe.
        </p>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => reset()} 
              size="xl" 
              className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-none shadow-lg shadow-red-900/20"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Try Again
            </Button>
            <Button asChild variant="outline" size="xl" className="w-full border-slate-700 hover:bg-slate-800 text-slate-300">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Back to Safety
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
