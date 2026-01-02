"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { CheckInButton } from "@/components/dashboard/check-in-button";
import { ProblemLogger } from "@/components/dashboard/problem-logger";
import { DSASheets } from "@/components/dashboard/dsa-sheets";
import { Heatmap } from "@/components/heatmap/heatmap";
import { Button } from "@/components/ui/button";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import {
  Flame,
  Gem,
  LogOut,
  Target,
  History,
} from "lucide-react";
import { ProblemList } from "@/components/dashboard/problem-list";
import { Sparkles } from "@/components/ui/sparkles";

interface DashboardData {
  user: {
    name: string | null;
    email: string;
    image: string | null;
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
  const [editingProblem, setEditingProblem] = useState<{
    id: string;
    topic: string;
    name: string;
    difficulty: string;
    externalUrl?: string; // Should match Problem interface from API
    tags?: string[];
    notes?: string;
  } | null>(null);

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

    if (!response.ok) {
      return {
        success: false,
        error: { message: result.error || "Failed to save problem" },
      };
    }

    // Refresh to show updated data
    router.refresh();
    setEditingProblem(null); // Clear edit mode on success
    return { success: true };
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-bold">
            <Flame className="h-5 w-5 text-orange-500" />
            <span>StreakDSA</span>
          </div>
          {/* Header Actions */}
          <div className="flex items-center gap-3">
            {/* Gems */}
            <div className="flex items-center gap-1.5 bg-purple-500/10 px-3 py-1.5 rounded-full">
              <Gem className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-semibold gems-display">
                {data.gems}
              </span>
            </div>

            {/* Logs Link */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/logs")}
              className="text-muted-foreground hover:text-foreground mr-1 hidden md:flex"
            >
              <History className="h-4 w-4 mr-2" />
              Logs
            </Button>

            {/* Sign Out Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-muted-foreground hover:text-foreground"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>

            {/* Profile */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/profile")}
                className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
              >
                {data.user.image ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.user.image}
                      alt={data.user.name || "Profile"}
                      className="h-8 w-8 rounded-full border border-border hover:border-purple-500 transition-colors"
                    />
                  </>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-semibold hover:bg-purple-600 transition-colors">
                    {(data.user.name || data.user.email)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

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
          <Heatmap days={data.heatmapDays} />
        </section>

        {/* Problem Logger & List */}
        <section className="space-y-4">
          <ProblemLogger
            initialData={
              editingProblem
                ? {
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
          />
          <ProblemList
            problems={data.today.problems}
            onDelete={async (id) => {
              await fetch(`/api/problems?id=${id}`, { method: "DELETE" });
              router.refresh();
            }}
            onEdit={(problem) => {
              setEditingProblem({
                ...problem,
                topic: problem.topic,
                tags: problem.tags || [problem.topic], // Use actual tags or fallback
                notes: problem.notes || "", // Use actual notes
                externalUrl: problem.externalUrl || undefined,
              });
              // Scroll to top to see the editor
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </section>

        {/* DSA Sheets (Permanent) */}
        <section>
          <DSASheets />
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-muted-foreground">
        <p>Keep grinding. Your future self will thank you.</p>
      </footer>
    </div>
  );
}
