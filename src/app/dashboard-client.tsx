"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CheckInButton } from "@/components/dashboard/check-in-button";
import { ProblemLogger } from "@/components/dashboard/problem-logger";
import { DSASheets } from "@/components/dashboard/dsa-sheets";
import { Heatmap } from "@/components/heatmap/heatmap";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Target, History as HistoryIcon } from "lucide-react";
import { ProblemList } from "@/components/dashboard/problem-list";
import { Sparkles } from "@/components/ui/sparkles";
import { MilestoneModal } from "@/components/dashboard/milestone-modal";
import { MeltModal } from "@/components/dashboard/melt-modal";
import { FlameEffect } from "@/components/ui/flame-effect";

interface DashboardData {
    user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
        dailyLimit: number;
    };
    pledge: {
        totalDays: number;
        daysCompleted: number;
        daysRemaining: number;
        startDate: string;
        endDate: string;
    };
    streak: {
        current: number;
        max: number;
    };
    gems: number;
    today: {
        completed: boolean;
        deadlineAt: string;
        problemsLogged: number;
        problems: Array<{
            id: string;
            topic: string;
            name: string;
            difficulty: string;
            externalUrl?: string | null;
        }>;
    };
    heatmapDays: Array<{
        date: string;
        completed: boolean;
        isMilestone: boolean;
    }>;
    activityData: unknown[];
}

interface Props {
    data: DashboardData;
}

export function DashboardClient({ data }: Props) {
    const router = useRouter();
    const params = useParams();

    const [editingProblem, setEditingProblem] = useState<{
        id: string;
        topic: string;
        name: string;
        difficulty: string;
        externalUrl?: string;
        tags?: string[];
        notes?: string;
    } | null>(null);

    const [milestoneStreak, setMilestoneStreak] = useState<number | null>(null);
    const [isMeltModalOpen, setIsMeltModalOpen] = useState(false);
    const [showFlameEffect, setShowFlameEffect] = useState(false);
    const problemLoggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Refresh every 5 mins to sync gems/streak if needed
        const interval = setInterval(() => {
            router.refresh();
        }, 300000);
        return () => clearInterval(interval);
    }, [router]);

    const handleLogProblem = async (problemData: {
        id?: string;
        topic: string;
        name: string;
        difficulty: string;
        externalUrl?: string;
        tags?: string[];
        notes?: string;
    }) => {
        const method = problemData.id ? "PATCH" : "POST";
        const response = await fetch("/api/problems", {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(problemData),
        });
        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: { message: result.error || "Failed to save problem" },
            };
        }

        router.refresh();
        setEditingProblem(null);

        if (
            result.data?.milestone === "10_DAY_STREAK" ||
            result.data?.milestone === "1_DAY_MILESTONE" ||
            result.data?.milestone === "7_DAY_STREAK" ||
            result.data?.milestone === "30_DAY_STREAK"
        ) {
            setMilestoneStreak(result.data.streak);
        }

        if (result.data?.melted) {
            setShowFlameEffect(true);
            setIsMeltModalOpen(true);
            setTimeout(() => setShowFlameEffect(false), 4000);
        }

        return { success: true };
    };

    return (
        <div className="min-h-screen">
            <main className="container mx-auto px-4 py-6 space-y-8 max-w-2xl">
                <section className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">
                        Current Streak
                    </p>
                    <Sparkles>
                        <div className="streak-hero mb-2">{data.streak.current}</div>
                    </Sparkles>
                    <p className="text-xl text-muted-foreground">
                        {data.streak.current === 1 ? "Day" : "Days"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                        Best:{" "}
                        <span className="text-orange-400 font-semibold">
                            {data.streak.max} days
                        </span>
                    </p>
                </section>

                <section>
                    <CardSpotlight
                        className="p-4 transition-all hover:border-purple-500/50"
                        color="rgba(168, 85, 247, 0.15)"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-purple-400" />
                                <span className="text-sm font-medium">Pledge Progress</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {data.pledge.daysCompleted}/{data.pledge.totalDays} days
                            </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                style={{
                                    width: `${Math.min(
                                        (data.pledge.daysCompleted / data.pledge.totalDays) * 100,
                                        100
                                    )}%`,
                                }}
                            />
                        </div>
                    </CardSpotlight>
                </section>

                <section>
                    <CheckInButton completed={data.today.completed} />
                </section>

                <section>
                    <CardSpotlight
                        className="p-6 transition-all hover:border-purple-500/50"
                        color="rgba(168, 85, 247, 0.15)"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <HistoryIcon className="h-4 w-4 text-purple-400" />
                            <span className="text-sm font-medium text-white">Activity Log</span>
                        </div>
                        <Heatmap days={data.heatmapDays} />
                    </CardSpotlight>
                </section>

                <section ref={problemLoggerRef} className="space-y-4">
                    <ProblemLogger
                        initialData={
                            editingProblem
                                ? {
                                    id: editingProblem.id,
                                    topic: editingProblem.topic,
                                    name: editingProblem.name,
                                    difficulty: editingProblem.difficulty,
                                    externalUrl: editingProblem.externalUrl,
                                    tags: editingProblem.tags,
                                    notes: editingProblem.notes,
                                }
                                : null
                        }
                        onCancel={() => setEditingProblem(null)}
                        onLogProblem={handleLogProblem}
                        limit={data.user.dailyLimit}
                        currentCount={data.today.problemsLogged}
                    />
                    <ProblemList
                        problems={data.today.problems}
                        onDelete={async (id) => {
                            await fetch(`/api/problems?id=${id}`, { method: "DELETE" });
                            router.refresh();
                        }}
                        onEdit={(problem) => {
                            setEditingProblem({
                                id: problem.id,
                                topic: problem.topic,
                                name: problem.name,
                                difficulty: problem.difficulty,
                                tags: problem.tags || [problem.topic],
                                notes: problem.notes || "",
                                externalUrl: problem.externalUrl || undefined,
                            });
                            problemLoggerRef.current?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                            });
                        }}
                    />
                </section>

                <section>
                    <DSASheets />
                </section>
            </main>

            <footer className="py-8 text-center text-xs text-muted-foreground space-y-2">
                <p>Keep grinding. Your future self will thank you.</p>
                <p className="opacity-70">
                    Developed by{" "}
                    <a
                        href="https://shantanukudva.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground/80 hover:text-orange-500 transition-colors"
                    >
                        Shantanu Kudva
                    </a>
                    {" | "}
                    <a
                        href="https://www.linkedin.com/in/shantanu-kudva"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground/80 transition-colors"
                    >
                        LinkedIn
                    </a>
                </p>
            </footer>

            {milestoneStreak && (
                <MilestoneModal
                    isOpen={!!milestoneStreak}
                    onClose={() => {
                        setMilestoneStreak(null);
                        router.refresh();
                    }}
                    streak={milestoneStreak}
                />
            )}

            <MeltModal
                isOpen={isMeltModalOpen}
                onClose={() => setIsMeltModalOpen(false)}
                refundAmount={50}
            />

            {showFlameEffect && <FlameEffect />}
        </div>
    );
}
