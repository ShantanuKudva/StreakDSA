import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldOff, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-full ring-1 ring-red-500/20">
          <ShieldOff className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold text-white">403</h1>
        <h2 className="text-xl text-slate-300">Access Denied</h2>
        <p className="text-slate-400">
          You don&apos;t have permission to access this resource.
        </p>
        <Link href="/">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
