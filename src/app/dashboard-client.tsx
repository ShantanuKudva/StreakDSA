"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { CheckInButton } from "@/components/dashboard/check-in-button";
import { ProblemLogger } from "@/components/dashboard/problem-logger";
import { DSASheets } from "@/components/dashboard/dsa-sheets";
import { Heatmap } from "@/components/heatmap/heatmap";
import { Button } from "@/components/ui/button";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Flame, Target, History as HistoryIcon } from "lucide-react";
import { ProblemList } from "@/components/dashboard/problem-list";
import { Sparkles } from "@/components/ui/sparkles";
import { MilestoneModal } from "@/components/dashboard/milestone-modal";
import { MeltModal } from "@/components/dashboard/melt-modal";
import { FlameEffect } from "@/components/ui/flame-effect";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
}

interface Props {
  data: DashboardData;
}

export function DashboardClient({ data }: Props) {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [editingProblem, setEditingProblem] = useState<{
    id: string;
    topic: string;
    name: string;
    difficulty: string;
    externalUrl?: string; // Should match Problem interface from API
    tags?: string[];
    notes?: string;
  } | null>(null);

  const [milestoneStreak, setMilestoneStreak] = useState<number | null>(null);
  const [isMeltModalOpen, setIsMeltModalOpen] = useState(false);
  const [showFlameEffect, setShowFlameEffect] = useState(false);
  const [isLogoTextVisible, setIsLogoTextVisible] = useState(true);
  const problemLoggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Keep logo text visible for 30 seconds, then collapse
    const timer = setTimeout(() => {
      setIsLogoTextVisible(false);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogProblem = async (problemData: {
    id?: string;
    topic: string;
    name: string;
    difficulty: string;
    externalUrl?: string;
    tags?: string[];
    notes?: string;
  }) => {
    // Determine method: PATCH if id exists, else POST
    const method = problemData.id ? "PATCH" : "POST";
    const response = await fetch("/api/problems", {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(problemData),
    });
    const result = await response.json();
    console.log("[Dashboard] Problem log response:", result);

    if (!response.ok) {
      return {
        success: false,
        error: { message: result.error || "Failed to save problem" },
      };
    }

    // Refresh to show updated data
    router.refresh();
    setEditingProblem(null); // Clear edit mode on success

    // Check for milestones (1 day, 7 days, multiples of 10, 30 days)
    if (
      result.data?.milestone === "10_DAY_STREAK" ||
      result.data?.milestone === "1_DAY_MILESTONE" ||
      result.data?.milestone === "7_DAY_STREAK" ||
      result.data?.milestone === "30_DAY_STREAK"
    ) {
      setMilestoneStreak(result.data.streak);
    }

    // Check if freeze was melted
    if (result.data?.melted) {
      setShowFlameEffect(true);
      setIsMeltModalOpen(true);
      // Hide flame effect after 4 seconds
      setTimeout(() => setShowFlameEffect(false), 4000);
    }

    return { success: true };
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      {/* Header */}
      {/* Main content */}

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 space-y-8 max-w-2xl">
        {/* Hero Streak Section */}
        <section className="text-center py-8">
          {/* ... same streak hero ... */}
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

        {/* Progress Bar */}
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

        {/* Check-in Status */}
        <section>
          <CheckInButton completed={data.today.completed} />
        </section>

        {/* Heatmap */}
        <section>
          <CardSpotlight
            className="p-6 transition-all hover:border-purple-500/50"
            color="rgba(168, 85, 247, 0.15)"
          >
            <div className="flex items-center gap-2 mb-4">
              <HistoryIcon className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium">Activity Log</span>
            </div>
            <Heatmap days={data.heatmapDays} />
          </CardSpotlight>
        </section>

        {/* Problem Logger & List */}
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
                id: problem.id, // Explicitly set id for PATCH request
                topic: problem.topic,
                name: problem.name,
                difficulty: problem.difficulty,
                tags: problem.tags || [problem.topic],
                notes: problem.notes || "",
                externalUrl: problem.externalUrl || undefined,
              });
              // Scroll to the problem logger section
              problemLoggerRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          />
        </section>

        {/* DSA Sheets (Permanent) */}
        <section>
          <DSASheets />
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-muted-foreground space-y-2">
        <p>Keep grinding. Your future self will thank you.</p>
        <p className="opacity-50">Developed by Shantanu Kudva</p>
      </footer>

      {/* Milestone Modal */}
      {milestoneStreak && (
        <MilestoneModal
          isOpen={!!milestoneStreak}
          onClose={() => {
            setMilestoneStreak(null);
            router.refresh(); // Refresh to update gems
          }}
          streak={milestoneStreak}
        />
      )}

      {/* Melt Modal */}
      <MeltModal
        isOpen={isMeltModalOpen}
        onClose={() => setIsMeltModalOpen(false)}
        refundAmount={50}
      />

      {/* Flame Effect */}
      {showFlameEffect && <FlameEffect />}
    </div>
  );
}
