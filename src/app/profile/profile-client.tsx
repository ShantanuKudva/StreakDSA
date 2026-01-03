"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Edit2,
  Flame,
  Gem,
  Trophy,
  Trash2,
  Clock,
  PieChart as PieIcon,
  Hash as Tag,
  Calendar as CalendarIcon,
  Snowflake,
  History as HistoryIcon,
  ThermometerSnowflake,
  Share2,
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
import { ShareCard } from "@/components/profile/share-card";
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
import { Heatmap } from "@/components/heatmap/heatmap";
import { ActivityCharts } from "@/components/dashboard/activity-charts";
import { TimeHeatmap } from "@/components/dashboard/time-heatmap";

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
  const [reminderTime, setReminderTime] = useState(user.reminderTime);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [showSnowflakes, setShowSnowflakes] = useState(false);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [isMeltModalOpen, setIsMeltModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [problemLimit, setProblemLimit] = useState(user.dailyProblemLimit || 2);

  const handleUpdateLimit = async (newLimit: number) => {
    try {
      if (newLimit < 1) return;
      setProblemLimit(newLimit);
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyProblemLimit: newLimit }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Daily limit updated");
      router.refresh();
    } catch {
      toast.error("Failed to update limit");
    }
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

    // Count check-in
    if (
      selectedDayData.completedAtHour !== null &&
      selectedDayData.completedAtHour !== undefined
    ) {
      dist[selectedDayData.completedAtHour] =
        (dist[selectedDayData.completedAtHour] || 0) + 1;
    }

    const dayOfWeek = selectedDayData.date
      ? parseISO(selectedDayData.date).getDay()
      : 0;

    return Object.entries(dist).map(([hour, count]) => ({
      hour: Number(hour),
      dayOfWeek,
      count,
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

  const handleUpdateSettings = async (newTime: string) => {
    setReminderTime(newTime);
    try {
      await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderTime: newTime }),
      });
      toast.success("Settings updated");
    } catch {
      toast.error("Failed to update settings");
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
        toast.error(data.error || "Failed to freeze streak");
      }
    } catch {
      toast.error("Failed to freeze streak");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-muted-foreground hover:text-white"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Profile & Settings
          </h1>
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShareModalOpen(true)}
              className="border-purple-500/30 hover:bg-purple-500/20 text-purple-400"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Profile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT COLUMN (2/3) */}
          <div className="md:col-span-2 space-y-6">
            {/* User Info Card */}
            <CardSpotlight
              className="bg-[#1a1b1e]/80 border-white/5 backdrop-blur-sm p-0 transition-all hover:border-purple-500/50"
              color="rgba(168, 85, 247, 0.15)"
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {user.image ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={user.image}
                        alt=""
                        className="h-16 w-16 rounded-full border-2 border-emerald-500/50"
                      />
                    </>
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                      {(user.name || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {user.name || "Anonymous User"}
                    </h2>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                </div>

                {/* Problem Limit Setting */}
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="text-xs text-gray-400 font-medium">
                    Daily Limit:
                  </span>
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
              </CardContent>
            </CardSpotlight>

            {/* Heatmap Section */}
            <CardSpotlight
              className="p-6 transition-all hover:border-purple-500/50"
              color="rgba(168, 85, 247, 0.15)"
            >
              <div className="flex items-center gap-2 mb-4">
                <HistoryIcon className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-white">
                  Activity Log
                </span>
              </div>
              <Heatmap
                days={heatmapDays}
                onDayClick={setSelectedDate}
                selectedDate={selectedDate}
              />
            </CardSpotlight>

            {/* Activity Charts Section - Only shown when a date is selected */}
            {selectedDate && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-purple-400" />
                    Activity for{" "}
                    {format(parseISO(selectedDate), "MMMM d, yyyy")}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate(null)}
                    className="text-muted-foreground hover:text-white"
                  >
                    Clear Selection
                  </Button>
                </div>

                {/* Problems Solved on this day */}
                {selectedDayProblems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedDayProblems.map((p) => (
                      <CardSpotlight
                        key={p.id}
                        className="p-4 bg-zinc-900/50 border-white/5 transition-all hover:border-purple-500/30"
                        color="rgba(168, 85, 247, 0.1)"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              p.difficulty === "EASY"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : p.difficulty === "MEDIUM"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {p.difficulty}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {p.topic.replace(/_/g, " ")}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-white mb-2">
                          {p.name}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {p.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </CardSpotlight>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-zinc-900/30 rounded-xl border border-dashed border-white/5">
                    <p className="text-sm text-muted-foreground">
                      No problems logged on this day.
                    </p>
                  </div>
                )}

                {/* Time Distribution Heatmap - Now specific to the day */}
                <TimeHeatmap
                  data={dayDistribution}
                  highlightDayOnly={true}
                  problems={selectedDayProblems}
                />
              </div>
            )}

            <ActivityCharts data={activityData} />

            {/* Current Streak & Progress - Large Hero */}
            <Card className="bg-gradient-to-br from-[#1a1b1e] to-[#0f1012] border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.2)] animate-pulse-slow">
                    <Flame className="h-8 w-8 text-orange-500 fill-orange-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                      Current Streak
                    </p>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-5xl font-bold text-white tracking-tight">
                        {user.currentStreak}
                      </h2>
                      <span className="text-gray-500 font-medium">days</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Max: {user.maxStreak} days
                    </p>
                  </div>
                </div>

                {/* Freeze Option */}
                {isFrozenToday || isCompletedToday ? (
                  <div
                    className={`flex items-center justify-between p-4 ${
                      isCompletedToday
                        ? "bg-orange-500/10 border-orange-500/20"
                        : "bg-emerald-500/10 border-emerald-500/20"
                    } border rounded-lg animate-in fade-in duration-500`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full ${
                          isCompletedToday
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        } flex items-center justify-center`}
                      >
                        {isCompletedToday ? (
                          <Flame className="h-5 w-5 fill-current" />
                        ) : (
                          <ThermometerSnowflake className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isCompletedToday
                              ? "text-orange-100"
                              : "text-emerald-100"
                          }`}
                        >
                          {isCompletedToday
                            ? "Streak Active"
                            : "Streak Protected"}
                        </p>
                        <p
                          className={`text-xs ${
                            isCompletedToday
                              ? "text-orange-400/80"
                              : "text-emerald-400/80"
                          }`}
                        >
                          {isCompletedToday
                            ? "You logged a problem today!"
                            : "Frozen for today"}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-xs font-bold uppercase tracking-widest px-2 ${
                        isCompletedToday
                          ? "text-orange-500"
                          : "text-emerald-500"
                      }`}
                    >
                      {isCompletedToday ? "🔥 Done" : "Active"}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <Snowflake className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-cyan-100">
                          Streak Freeze
                        </p>
                        <p className="text-xs text-cyan-400/80">
                          Cost: 50 Gems
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400"
                      onClick={handleFreezeStreak}
                      disabled={user.gems < 50}
                    >
                      Freeze
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                      Total Solved
                    </p>
                    <p className="text-2xl font-semibold text-white">
                      {stats.totalProblems}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                      Freezes Used
                    </p>
                    <p className="text-2xl font-semibold text-white">
                      {freezeCount}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {user.daysCompleted} / {user.pledgeDays || 75} Days
                        Completed
                      </p>
                      <p className="text-sm text-gray-400">
                        Keep up the consistency!
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-emerald-500">
                      {progressPercent}%
                    </p>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pledge Details & Settings */}
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
                  {/* Coming Soon Banner */}
                  <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <span className="text-amber-400 text-xs font-medium">
                      🚧 Push notifications coming in next update
                    </span>
                  </div>

                  <div className="flex items-center justify-between opacity-50">
                    <div className="space-y-0.5">
                      <Label className="text-base text-white">
                        Email Reminders
                      </Label>
                      <p className="text-xs text-gray-400">
                        Get notified via email
                      </p>
                    </div>
                    <Switch
                      checked={false}
                      disabled={true}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between opacity-50">
                    <div className="space-y-0.5">
                      <Label className="text-base text-white">
                        WhatsApp Notifications
                      </Label>
                      <p className="text-xs text-gray-400">
                        Reminders via WhatsApp
                      </p>
                    </div>
                    <Switch
                      checked={false}
                      disabled={true}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between opacity-50">
                    <div className="space-y-0.5">
                      <Label className="text-base text-white">
                        SMS Notifications
                      </Label>
                      <p className="text-xs text-gray-400">
                        Text message reminders
                      </p>
                    </div>
                    <Switch
                      checked={false}
                      disabled={true}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>

                  <div className="space-y-2 opacity-50">
                    <Label className="text-sm text-gray-400">
                      Reminder Time
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                      <Input
                        type="time"
                        value={reminderTime}
                        disabled={true}
                        className="pl-9 bg-zinc-800 border-zinc-700 text-white w-full h-10 block cursor-not-allowed"
                        style={{ colorScheme: "dark" }}
                      />
                    </div>
                  </div>
                </CardContent>
              </CardSpotlight>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pie Chart: Difficulty */}
              <CardSpotlight
                className="bg-[#1a1b1e]/80 border-white/5 backdrop-blur-sm p-0 transition-all hover:border-purple-500/50"
                color="rgba(168, 85, 247, 0.15)"
              >
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <PieIcon className="h-4 w-4 text-emerald-500" />
                    Problems by Difficulty
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    <ChartContainer
                      config={{
                        EASY: {
                          label: "Easy",
                          color: "hsl(142.1 76.2% 36.3%)",
                        }, // emerald-600
                        MEDIUM: { label: "Medium", color: "hsl(32 95% 44%)" }, // amber-500
                        HARD: { label: "Hard", color: "hsl(0 84% 60%)" }, // red-500
                      }}
                      className="h-full w-full"
                    >
                      <PieChart>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                          data={difficultyData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          strokeWidth={5}
                        >
                          {difficultyData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              stroke="rgba(0,0,0,0.5)"
                            />
                          ))}
                          <RechartsLabel
                            content={({ viewBox }) => {
                              if (
                                viewBox &&
                                "cx" in viewBox &&
                                "cy" in viewBox
                              ) {
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
                                      className="fill-foreground text-3xl font-bold"
                                    >
                                      {stats.totalProblems}
                                    </tspan>
                                    <tspan
                                      x={viewBox.cx}
                                      y={(viewBox.cy || 0) + 24}
                                      className="fill-muted-foreground text-xs"
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
                  <div className="flex justify-center gap-4 mt-4">
                    {difficultyData.map((d) => (
                      <div
                        key={d.name}
                        className="flex items-center gap-1.5 text-xs text-gray-400"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: d.color }}
                        />
                        {d.name} ({d.value})
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CardSpotlight>

              {/* Bar Chart: Top Tags */}
              <CardSpotlight
                className="bg-[#1a1b1e]/80 border-white/5 backdrop-blur-sm p-0 transition-all hover:border-purple-500/50"
                color="rgba(168, 85, 247, 0.15)"
              >
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Tag className="h-4 w-4 text-purple-500" />
                    Top 5 Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    <ChartContainer
                      config={{
                        count: {
                          label: "Problems",
                          color: "hsl(270 95% 60%)", // purple-500
                        },
                      }}
                      className="h-full w-full"
                    >
                      <BarChart
                        data={topicData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                      >
                        <CartesianGrid
                          horizontal={false}
                          stroke="#333"
                          strokeDasharray="3 3"
                        />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          tickLine={false}
                          axisLine={false}
                          width={100}
                          tick={{ fill: "#9ca3af", fontSize: 11 }}
                        />
                        <ChartTooltip
                          cursor={{ fill: "rgba(168, 85, 247, 0.1)" }}
                          content={<ChartTooltipContent />}
                        />
                        <Bar
                          dataKey="count"
                          fill="var(--color-count)"
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                        >
                          <RechartsLabel
                            position="right"
                            fill="#fff"
                            fontSize={10}
                            formatter={(value: number) => value}
                          />
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </CardSpotlight>
            </div>
          </div>

          {/* RIGHT COLUMN (1/3) */}
          <div className="space-y-6">
            {/* Tag Cloud / Stats Mini Card */}
            <CardSpotlight
              className="bg-[#1a1b1e]/80 border-white/5 backdrop-blur-sm p-0 transition-all hover:border-purple-500/50"
              color="rgba(168, 85, 247, 0.15)"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Tag className="h-4 w-4 text-purple-400" />
                  All Tags ({stats.byTopic.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stats.byTopic.map((t) => (
                    <div
                      key={t.topic}
                      className="text-xs bg-purple-500/10 text-purple-300 px-2 py-1 rounded-md border border-purple-500/20"
                    >
                      {t.topic.replace(/_/g, " ")}{" "}
                      <span className="text-purple-500/60 ml-1">{t.count}</span>
                    </div>
                  ))}
                  {stats.byTopic.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      No tags yet.
                    </span>
                  )}
                </div>
              </CardContent>
            </CardSpotlight>

            {/* Max Streak Card */}
            <CardSpotlight
              className="bg-[#1a1b1e]/80 border-white/5 backdrop-blur-sm p-0 transition-all hover:border-purple-500/50"
              color="rgba(168, 85, 247, 0.15)"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold bg-white/5 text-gray-400 px-2 py-1 rounded">
                    ALL TIME
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Max Streak</p>
                  <h3 className="text-2xl font-bold text-white">
                    {user.maxStreak} Days
                  </h3>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-green-400 bg-green-500/5 px-2 py-1 rounded w-fit">
                  <Clock className="h-3 w-3" />
                  Record set recently
                </div>
              </CardContent>
            </CardSpotlight>

            {/* Gems/Points Card */}
            <CardSpotlight
              className="bg-[#1a1b1e]/80 border-white/5 backdrop-blur-sm p-0 transition-all hover:border-purple-500/50"
              color="rgba(168, 85, 247, 0.15)"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <Gem className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold bg-white/5 text-gray-400 px-2 py-1 rounded">
                    BALANCE
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Gems</p>
                  <h3 className="text-2xl font-bold text-white">{user.gems}</h3>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  Earn gems by completing daily challenges.
                </div>
              </CardContent>
            </CardSpotlight>

            {/* Danger Zone */}
            <CardSpotlight
              className="bg-red-500/5 border-red-500/20 backdrop-blur-sm p-0"
              color="rgba(239, 68, 68, 0.15)"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-red-400 text-base flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full bg-red-600/10 text-red-500 hover:bg-red-600/20 border-none"
                    >
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
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
                      <AlertDialogCancel className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-white">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </CardSpotlight>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-muted-foreground space-y-2">
        <p>Keep grinding. Your future self will thank you.</p>
        <p className="opacity-50">Developed by Shantanu Kudva</p>
      </footer>

      {showSnowflakes && <SnowflakeEffect />}
      <FreezeModal
        isOpen={isFreezeModalOpen}
        onClose={() => setIsFreezeModalOpen(false)}
      />
      <MeltModal
        isOpen={isMeltModalOpen}
        onClose={() => setIsMeltModalOpen(false)}
        refundAmount={50}
      />
      {/* Share Modal */}
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
    </div>
  );
}
