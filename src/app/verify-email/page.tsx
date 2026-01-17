import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default async function VerifyEmailPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const { token } = await searchParams;
    let status: "success" | "error" | "missing" = "missing";

    if (token) {
        const verification = await db.verificationToken.findUnique({
            where: { token },
        });

        if (verification && verification.expires > new Date()) {
            // Verify user and delete token
            await db.$transaction([
                db.user.update({
                    where: { email: verification.identifier },
                    data: { emailVerified: new Date() },
                }),
                db.verificationToken.delete({ where: { token } }),
            ]);
            status = "success";
        } else {
            status = "error";
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <Card className="max-w-md w-full p-8 text-center space-y-6 bg-zinc-900 border-zinc-800 shadow-2xl">
                {status === "success" && (
                    <>
                        <div className="mx-auto h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-white">Email Verified!</h1>
                            <p className="text-zinc-400">
                                Your email has been successfully verified. You now have full access to all features.
                            </p>
                        </div>
                        <Link href="/dashboard" className="block w-full">
                            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                                Go to Dashboard
                            </Button>
                        </Link>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="mx-auto h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center">
                            <XCircle className="h-10 w-10 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-white">Verification Failed</h1>
                            <p className="text-zinc-400">
                                The verification link is invalid or has expired. Please request a new one from your profile settings.
                            </p>
                        </div>
                        <Link href="/login" className="block w-full">
                            <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                                Back to Login
                            </Button>
                        </Link>
                    </>
                )}

                {status === "missing" && (
                    <>
                        <div className="mx-auto h-20 w-20 bg-amber-500/10 rounded-full flex items-center justify-center">
                            <AlertTriangle className="h-10 w-10 text-amber-500" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-white">Invalid Link</h1>
                            <p className="text-zinc-400">
                                This verification link appears to be missing a token.
                            </p>
                        </div>
                        <Link href="/" className="block w-full">
                            <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                                Go Home
                            </Button>
                        </Link>
                    </>
                )}
            </Card>
        </div>
    );
}
