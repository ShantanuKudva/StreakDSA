"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();

    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            toast.error("Invalid Link", {
                description: "Missing reset token.",
            });
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match", {
                description: "Please make sure your passwords match.",
            });
            return;
        }

        if (!token) return;

        setLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Something went wrong");
            }

            toast.success("Success! 🔐", {
                description: "Your password has been reset. Redirecting to login...",
            });

            // Redirect to login after delay
            setTimeout(() => {
                router.push("/login?reset=success");
            }, 2000);

        } catch (error: unknown) {
            toast.error("Error", {
                description: error instanceof Error ? error.message : "Failed to reset password.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <h2 className="text-xl font-bold text-red-500">Invalid Link</h2>
                <p className="text-muted-foreground">This password reset link is invalid or missing.</p>
                <Link href="/forgot-password"><Button>Request New Link</Button></Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
            <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        disabled={loading}
                        className="bg-zinc-950/50 border-zinc-800 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input
                    id="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-zinc-950/50 border-zinc-800"
                />
            </div>

            <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                    </>
                ) : (
                    "Reset Password"
                )}
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Set New Password</h1>
                    <p className="text-sm text-muted-foreground">
                        Please enter your new password below.
                    </p>
                </div>

                <Suspense fallback={<div className="text-center p-4"><Loader2 className="animate-spin mx-auto" /></div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
