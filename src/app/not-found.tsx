import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="relative z-10 max-w-md w-full">
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-900/20 p-6 rounded-2xl mb-8 inline-block">
            <FileQuestion className="h-16 w-16 text-purple-400" />
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-gray-400 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button asChild size="xl" className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 border-none shadow-lg shadow-purple-900/20">
              <Link href="/" className="flex items-center justify-center gap-2">
                <Home className="h-5 w-5" />
                Return to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
