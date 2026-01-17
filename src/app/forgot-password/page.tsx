"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) throw new Error("Something went wrong");

            setSubmitted(true);
            toast.success("Check your email", {
                description: "If an account exists, we sent a password reset link.",
            });
        } catch {
            toast.error("Error", {
                description: "Failed to send reset email. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md space-y-8 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 text-center">
                    <div className="text-4xl">📨</div>
                    <h2 className="text-2xl font-bold tracking-tight">Check your email</h2>
                    <p className="text-muted-foreground">
                        We&apos;ve sent a password reset link to <strong>{email}</strong>.
                    </p>
                    <div className="pt-4">
                        <Link href="/login">
                            <Button variant="outline" className="w-full">
                                Back to Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {/* Back Button */}
            <div className="w-full max-w-md mb-8">
                <Link
                    href="/login"
                    className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                </Link>
            </div>

            <div className="w-full max-w-md space-y-8 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email address and we&apos;ll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            className="bg-zinc-950/50 border-zinc-800 focus:border-orange-500/50 focus:ring-orange-500/20"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Send Reset Link"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
