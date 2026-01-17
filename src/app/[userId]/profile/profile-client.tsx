"use client";

import { useState, useMemo, useRef } from "react";
import {
  ArrowLeft,
  Flame,
  Gem,
  Trophy,
  Trash2,
  Clock,
  PieChart as PieIcon,
  Hash,
  Hash as Tag,
  Calendar as CalendarIcon,
  Snowflake,
  History as HistoryIcon,
  ThermometerSnowflake,
  Share2,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { format, parseISO, addDays } from "date-fns";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SnowflakeEffect } from "@/components/ui/snowflake-effect";
import { FreezeModal } from "@/components/dashboard/freeze-modal";
import { MeltModal } from "@/components/dashboard/melt-modal";
import { ShareModal } from "@/components/profile/share-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Label as RechartsLabel,
  CartesianGrid,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heatmap } from "@/components/heatmap/heatmap";
import { ActivityCharts } from "@/components/dashboard/activity-charts";
import { TimeHeatmap } from "@/components/dashboard/time-heatmap";
import { usePushNotifications } from "@/hooks/use-push-notifications";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  pledgeDays: number;
  startDate: string;
  reminderTime: string;
  timezone: string;
  currentStreak: number;
  maxStreak: number;
  daysCompleted: number;
  gems: number;
  createdAt: string;
  dailyProblemLimit?: number;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  emailVerified?: string | null;
}

interface ProfileStats {
  totalProblems: number;
  byDifficulty: { difficulty: string; count: number }[];
  byTopic: { topic: string; count: number }[];
}

interface Props {
  user: UserData;
  stats: ProfileStats;
  heatmapDays: Array<{
    date: string;
    completed: boolean;
    isFrozen: boolean;
    isMilestone: boolean;
    problems?: Array<{
      id: string;
      topic: string;
      name: string;
      difficulty: string;
      externalUrl: string | null;
      tags: string[];
      hour: number;
    }>;
    completedAtHour?: number | null;
  }>;
  activityData: Array<{
    date: string;
    problems: number;
    checkInTime: string | null;
  }>;
  timeDistribution: Array<{
    hour: number;
    dayOfWeek: number;
    count: number;
  }>;
  freezeCount: number;
}

export function ProfileClient({
  user,
  stats,
  heatmapDays = [],
  activityData = [],
  freezeCount = 0,
}: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showSnowflakes, setShowSnowflakes] = useState(false);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [isMeltModalOpen, setIsMeltModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [problemLimit, setProblemLimit] = useState(user.dailyProblemLimit || 2);
  const { subscribe, unsubscribe } = usePushNotifications();

  // Notification state
  const [emailEnabled, setEmailEnabled] = useState(user.emailNotifications ?? true);
  const [pushEnabled, setPushEnabled] = useState(user.pushNotifications ?? false);
  const [isTogglingEmail, setIsTogglingEmail] = useState(false);
  const [isTogglingPush, setIsTogglingPush] = useState(false);

  // Debounce ref for daily limit update
  const limitUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleUpdateLimit = async (newLimit: number) => {
    if (newLimit < 1 || newLimit > 10) return;
    setProblemLimit(newLimit);

    // Clear any pending update
    if (limitUpdateTimeoutRef.current) {
      clearTimeout(limitUpdateTimeoutRef.current);
    }

    // Debounce the API call by 500ms
    limitUpdateTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/user/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dailyProblemLimit: newLimit }),
        });
        if (!res.ok) throw new Error("Failed to update");
        toast.success("Daily limit updated");
      } catch {
        toast.error("Failed to update limit");
      }
    }, 500);
  };

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayData = useMemo(() => {
    return heatmapDays.find((d) => d.date === todayStr);
  }, [heatmapDays, todayStr]);

  const isFrozenToday = todayData?.isFrozen || false;
  const isCompletedToday = todayData?.completed || false;

  // Calculations
  const startDate = user.startDate
    ? parseISO(user.startDate)
    : parseISO(user.createdAt);
  const endDate = addDays(startDate, user.pledgeDays || 75);
  const progressPercent =
    user.pledgeDays > 0
      ? Math.min(100, Math.round((user.daysCompleted / user.pledgeDays) * 100))
      : 0;

  const selectedDayData = heatmapDays.find((d) => d.date === selectedDate);
  const selectedDayProblems = useMemo(
    () => selectedDayData?.problems || [],
    [selectedDayData]
  );

  const dayDistribution = useMemo(() => {
    if (!selectedDayData) return [];
    const dist: Record<number, number> = {};

    // Count problems
    selectedDayProblems.forEach((p) => {
      dist[p.hour] = (dist[p.hour] || 0) + 1;
    });

    const dayOfWeek = selectedDayData.date
      ? parseISO(selectedDayData.date).getDay()
      : 0;

    return Object.entries(dist).map(([hour, count]) => ({
      hour: Number(hour),
      dayOfWeek,
      count: Number(count),
    }));
  }, [selectedDayData, selectedDayProblems]);

  // Chart Data Preparation
  const COLORS = {
    EASY: "#10B981", // Emerald 500
    MEDIUM: "#F59E0B", // Amber 500
    HARD: "#EF4444", // Red 500
  };

  const difficultyData = stats.byDifficulty.map((item) => ({
    name: item.difficulty,
    value: item.count,
    color: COLORS[item.difficulty as keyof typeof COLORS] || "#8884d8",
  }));

  const topicData = stats.byTopic.slice(0, 5).map((item) => ({
    name: item.topic.replace("_", " "),
    count: item.count,
  }));

  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyEmail = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch("/api/auth/send-verification", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Verification email sent! Check your inbox.");
      } else {
        toast.error(data.error || "Failed to send verification email");
      }
    } catch {
      toast.error("Failed to send verification email");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (res.ok) {
        toast.success("Account deleted");
        signOut({ callbackUrl: "/login" });
      } else {
        toast.error("Failed to delete account");
      }
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFreezeStreak = async () => {
    try {
      const res = await fetch("/api/streak/freeze", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setShowSnowflakes(true);
        setIsFreezeModalOpen(true);
        toast.success("Streak frozen for today! ❄️");

        // Hide snowflakes after 5 seconds
        setTimeout(() => setShowSnowflakes(false), 5000);

        router.refresh();
      } else {
        const errorMessage = typeof data.error === "object" ? data.error.message : data.error;
        toast.error(errorMessage || "Failed to freeze streak");
      }
    } catch {
      toast.error("Failed to freeze streak");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto space-y-6 p-6">


        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-[#1a1b1e]/80 border border-white/5 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB - Clean & Essential */}
          <TabsContent value="overview" className="space-y-6">
            {/* Hero Card - Identity & Main Streak */}
            <CardSpotlight className="bg-[#1a1b1e]/80 border-white/5 p-8" color="rgba(168, 85, 247, 0.15)">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  {user.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={user.image} alt="" className="h-20 w-20 rounded-full border-4 border-[#1a1b1e] shadow-xl" />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-2xl font-bold border-4 border-[#1a1b1e] shadow-xl">
                      {(user.name || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-white tracking-tight">{user.name || "Anonymous User"}</h2>
                    <p className="text-gray-400 text-sm font-medium">{user.email}</p>
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsShareModalOpen(true)}
                        className="h-8 px-3 text-xs uppercase tracking-wider text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 -ml-2"
                      >
                        <Share2 className="h-3 w-3 mr-1.5" />
                        Share Profile
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full sm:w-auto">
                  {/* Status / Freeze Action */}
                  {isFrozenToday || isCompletedToday ? (
                    <div className={`flex items-center gap-3 p-3 rounded-lg border w-full sm:w-auto ${isCompletedToday
                      ? "bg-orange-500/10 border-orange-500/20"
                      : "bg-emerald-500/10 border-emerald-500/20"
                      }`}>
                      <div className={`h-10 w-10 rounded-full shrink-0 ${isCompletedToday
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-emerald-500/20 text-emerald-400"
                        } flex items-center justify-center`}>
                        {isCompletedToday ? <Flame className="h-5 w-5 fill-current" /> : <ThermometerSnowflake className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${isCompletedToday ? "text-orange-100" : "text-emerald-100"}`}>
                          {isCompletedToday ? "Streak Active" : "Streak Protected"}
                        </p>
                        <p className={`text-xs ${isCompletedToday ? "text-orange-400/80" : "text-emerald-400/80"}`}>
                          {isCompletedToday ? "🔥 Done" : "Frozen for today"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-colors w-full sm:w-auto">
                      <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                        <Snowflake className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-cyan-100">Streak Freeze</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 mt-1 text-xs border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 w-full"
                          onClick={handleFreezeStreak}
                          disabled={user.gems < 50}
                        >
                          Freeze (50 Gems)
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Streak Counter */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.2)] animate-pulse-slow shrink-0">
                      <Flame className="h-7 w-7 sm:h-8 sm:w-8 text-orange-500 fill-orange-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wider">Current Streak</p>
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">{user.currentStreak}</h2>
                        <span className="text-gray-500 font-medium">days</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Max: {user.maxStreak} days</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardSpotlight>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Progress & Actions (2 cols wide) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Progress Card */}
                <Card className="bg-[#1a1b1e]/80 border-white/5 p-6 h-full flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Challenge Progress</h3>
                      <p className="text-sm text-gray-500">Keep up the consistency!</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{progressPercent}%</p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-4 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 font-medium px-1">
                      <span>Start: {format(startDate, "MMM d")}</span>
                      <span>Target: {user.pledgeDays} Days</span>
                      <span>End: {format(endDate, "MMM d")}</span>
                    </div>
                  </div>
                </Card>


              </div>

              {/* Right Column: Stats Grid (1 col wide) */}
              <div className="space-y-4">
                {/* Max Streak */}
                <Card className="bg-[#1a1b1e]/80 border-white/5 p-4 flex items-center gap-4 hover:border-purple-500/30 transition-colors">
                  <div className="p-3 bg-purple-500/10 rounded-xl">
                    <Trophy className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{user.maxStreak}</p>
                    <p className="text-xs text-gray-500">Best Streak</p>
                  </div>
                </Card>

                {/* Problems Solved */}
                <Card className="bg-[#1a1b1e]/80 border-white/5 p-4 flex items-center gap-4 hover:border-emerald-500/30 transition-colors">
                  <div className="p-3 bg-emerald-500/10 rounded-xl">
                    <Hash className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{stats.totalProblems}</p>
                    <p className="text-xs text-gray-500">Problems Solved</p>
                  </div>
                </Card>

                {/* Gems */}
                <Card className="bg-[#1a1b1e]/80 border-white/5 p-4 flex items-center gap-4 hover:border-blue-500/30 transition-colors">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <Gem className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{user.gems}</p>
                    <p className="text-xs text-gray-500">Total Gems</p>
                  </div>
                </Card>

                {/* Freezes Used */}
                <Card className="bg-[#1a1b1e]/80 border-white/5 p-4 flex items-center gap-4 hover:border-cyan-500/30 transition-colors">
                  <div className="p-3 bg-cyan-500/10 rounded-xl">
                    <ThermometerSnowflake className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{freezeCount}</p>
                    <p className="text-xs text-gray-500">Freezes Used</p>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ACTIVITY TAB - Detailed Analytics */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-[#1a1b1e]/80 border-white/5 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HistoryIcon className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">Activity Log</span>
                  <span className="text-[10px] text-muted-foreground ml-2">(Click a day for more info)</span>
                </div>
              </div>
              <div className="overflow-x-auto pb-2">
                <Heatmap days={heatmapDays} onDayClick={setSelectedDate} selectedDate={selectedDate} />
              </div>
            </Card>

            {selectedDate && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5 text-purple-400" />
                      {format(parseISO(selectedDate), "MMMM d, yyyy")}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedDayProblems.length} problems solved • Your activity breakdown
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate(null)}
                    className="text-muted-foreground hover:text-white hover:bg-white/5 h-9 px-4 rounded-full"
                  >
                    Clear Selection
                  </Button>
                </div>

                {selectedDayProblems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedDayProblems.map((p) => (
                      <CardSpotlight
                        key={p.id}
                        className="p-4 bg-zinc-900/40 border-white/5 transition-all hover:border-purple-500/30"
                        color="rgba(168, 85, 247, 0.1)"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.difficulty === "EASY"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : p.difficulty === "MEDIUM"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-red-500/10 text-red-400"
                              }`}
                          >
                            {p.difficulty}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {p.hour}:00
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white mb-1">{p.name}</h4>
                        <p className="text-[11px] text-gray-400 font-medium">
                          {p.topic.replace(/_/g, " ")}
                        </p>
                      </CardSpotlight>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-zinc-900/20 rounded-2xl border border-dashed border-white/5">
                    <p className="text-sm text-muted-foreground">
                      No problems logged on this day.
                    </p>
                  </div>
                )}

                <div className="bg-zinc-900/30 rounded-2xl border border-white/5 p-6">
                  <TimeHeatmap
                    data={dayDistribution}
                    highlightDayOnly={true}
                    problems={selectedDayProblems}
                  />
                </div>
              </div>
            )}

            {/* Activity Charts */}
            <ActivityCharts data={activityData} />

            {/* Problem Stats Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Difficulty Pie Chart */}
              <Card className="bg-[#1a1b1e]/80 border-white/5 p-6 flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <PieIcon className="h-4 w-4 text-emerald-500" />
                  By Difficulty
                </h3>
                <div className="flex-1 min-h-[300px] w-full mt-2">
                  <ChartContainer
                    config={{
                      EASY: { label: "Easy", color: COLORS.EASY },
                      MEDIUM: { label: "Medium", color: COLORS.MEDIUM },
                      HARD: { label: "Hard", color: COLORS.HARD },
                    }}
                    className="h-full w-full"
                  >
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={difficultyData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {difficultyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                        <RechartsLabel
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-white text-3xl font-bold"
                                  >
                                    {stats.totalProblems}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-gray-400 text-xs"
                                  >
                                    Solved
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </div>
                <div className="flex justify-center gap-6 mt-6">
                  {difficultyData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-gray-300">{d.name}</span>
                      <span className="text-gray-500 font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Topics Bar Chart */}
              <Card className="bg-[#1a1b1e]/80 border-white/5 p-6 flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-purple-400" />
                  Top Topics
                </h3>
                <div className="flex-1 min-h-[300px] w-full">
                  <ChartContainer
                    config={{
                      count: { label: "Count", color: "#A855F7" }, // Purple 500
                    }}
                    className="h-full w-full"
                  >
                    <BarChart
                      data={topicData}
                      layout="vertical"
                      margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{ fill: "#9CA3AF", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <ChartTooltip
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                        content={<ChartTooltipContent />}
                      />
                      <Bar
                        dataKey="count"
                        fill="#A855F7"
                        radius={[0, 4, 4, 0]}
                        barSize={32}
                      >
                        <RechartsLabel
                          position="right"
                          fill="#ffffff"
                          fontSize={12}
                          offset={8}
                        />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pledge Details */}
              <CardSpotlight
                className="bg-[#1a1b1e]/80 border-white/5 h-full backdrop-blur-sm p-0 transition-all hover:border-purple-500/50"
                color="rgba(168, 85, 247, 0.15)"
              >
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    Pledge Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Start Date</span>
                    <span className="text-white font-medium">
                      {format(startDate, "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">End Date</span>
                    <span className="text-white font-medium">
                      {format(endDate, "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400 text-sm">
                      Review Frequency
                    </span>
                    <span className="text-white font-medium">Daily</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-t border-white/5 pt-4">
                    <span className="text-gray-400 text-sm">
                      Daily Problem Goal
                    </span>
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={problemLimit}
                        onChange={(e) =>
                          handleUpdateLimit(parseInt(e.target.value) || 2)
                        }
                        className="w-12 h-6 text-center p-0 border-none bg-transparent focus:ring-0 text-white font-bold"
                      />
                    </div>
                  </div>
                </CardContent>
              </CardSpotlight>

              {/* Notification Settings */}
              <CardSpotlight
                className="bg-[#1a1b1e]/80 border-white/5 h-full backdrop-blur-sm p-0 transition-all hover:border-purple-500/50"
                color="rgba(168, 85, 247, 0.15)"
              >
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Account Verification */}
                  <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-white/5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-base text-white">Account Status</Label>
                        {user.emailVerified ? (
                          <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Verified
                          </span>
                        ) : (
                          <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-medium flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Unverified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {user.emailVerified
                          ? "Your email address has been verified."
                          : "Verify your email to secure your account."}
                      </p>
                    </div>
                    {!user.emailVerified && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                        onClick={handleVerifyEmail}
                        disabled={isVerifying}
                      >
                        {isVerifying ? "Sending..." : "Verify Email"}
                      </Button>
                    )}
                  </div>

                  {/* Email Notifications Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base text-white">
                        Email Reminders
                      </Label>
                      <p className="text-xs text-gray-400">
                        Get daily reminders via email
                      </p>
                    </div>
                    <Switch
                      checked={emailEnabled}
                      disabled={isTogglingEmail}
                      onCheckedChange={async (checked) => {
                        setIsTogglingEmail(true);
                        try {
                          await fetch("/api/user/settings", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ emailNotifications: checked }),
                          });
                          setEmailEnabled(checked);
                          toast.success(checked ? "Email notifications enabled" : "Email notifications disabled");
                        } catch {
                          toast.error("Failed to update settings");
                        } finally {
                          setIsTogglingEmail(false);
                        }
                      }}
                      className="data-[state=checked]:bg-emerald-500 disabled:opacity-50"
                    />
                  </div>

                  {/* Push Notifications Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base text-white">
                        Push Notifications
                      </Label>
                      <p className="text-xs text-gray-400">
                        Browser notifications for reminders
                      </p>
                    </div>
                    <Switch
                      checked={pushEnabled}
                      disabled={isTogglingPush}
                      onCheckedChange={async (checked) => {
                        setIsTogglingPush(true);
                        try {
                          if (checked) {
                            const success = await subscribe();
                            if (success) setPushEnabled(true);
                          } else {
                            const success = await unsubscribe();
                            if (success) setPushEnabled(false);
                          }
                        } catch {
                          toast.error("Failed to update settings");
                        } finally {
                          setIsTogglingPush(false);
                        }
                      }}
                      className="data-[state=checked]:bg-emerald-500 disabled:opacity-50"
                    />
                  </div>

                  {/* Reminder Schedule Info */}
                  <div className="p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      <Clock className="inline h-3 w-3 mr-1" />
                      Reminders at <span className="text-white font-medium">12 PM</span>, <span className="text-white font-medium">6 PM</span>, <span className="text-white font-medium">9 PM</span>, <span className="text-white font-medium">11 PM</span> if you haven&apos;t checked in.
                    </p>
                  </div>
                </CardContent>
              </CardSpotlight>
            </div>

            {/* Danger Zone */}
            <CardSpotlight
              className="bg-red-500/5 border-red-500/20 backdrop-blur-sm p-0 transition-all hover:border-red-500/40"
              color="rgba(239, 68, 68, 0.15)"
            >
              <CardHeader>
                <CardTitle className="text-lg text-red-500 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-white font-medium">Delete Account</h4>
                    <p className="text-xs text-gray-400">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                          This action cannot be undone. This will permanently
                          delete your account and remove your data from our
                          servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-zinc-700 hover:bg-zinc-800 text-white hover:text-white">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                          className="bg-red-600 hover:bg-red-700 text-white border-none"
                        >
                          {isDeleting ? "Deleting..." : "Delete Account"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </CardSpotlight>
          </TabsContent>
        </Tabs>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        user={{ name: user.name, image: user.image }}
        stats={{
          currentStreak: user.currentStreak,
          maxStreak: user.maxStreak,
          totalProblems: stats.totalProblems,
          gems: user.gems,
          easyCount:
            stats.byDifficulty.find((d) => d.difficulty === "EASY")?.count || 0,
          mediumCount:
            stats.byDifficulty.find((d) => d.difficulty === "MEDIUM")?.count ||
            0,
          hardCount:
            stats.byDifficulty.find((d) => d.difficulty === "HARD")?.count || 0,
        }}
      />

      <FreezeModal
        isOpen={isFreezeModalOpen}
        onClose={() => setIsFreezeModalOpen(false)}
      />

      {showSnowflakes && <SnowflakeEffect />}
    </div>
  );
}
