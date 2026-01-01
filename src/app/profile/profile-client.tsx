"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Edit2,
  Flame,
  Gem,
  Trophy,
  Trash2,
  Clock,
  PieChart as PieIcon,
  BarChart as BarIcon,
  Hash as Tag,
  Calendar as CalendarIcon,
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
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Heatmap } from "@/components/heatmap/heatmap";

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
    isMilestone: boolean;
  }>;
}

export function ProfileClient({ user, stats, heatmapDays }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [reminderTime, setReminderTime] = useState(user.reminderTime);
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  // Calculations
  const startDate = user.startDate
    ? parseISO(user.startDate)
    : parseISO(user.createdAt);
  const endDate = addDays(startDate, user.pledgeDays || 75);
  const progressPercent =
    user.pledgeDays > 0
      ? Math.min(100, Math.round((user.daysCompleted / user.pledgeDays) * 100))
      : 0;

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
                    <img
                      src={user.image}
                      alt=""
                      className="h-16 w-16 rounded-full border-2 border-emerald-500/50"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                      {(user.name || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {user.name || "Anonymous User"}
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Pro Member
                      </span>
                    </h2>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </CardSpotlight>

            {/* Heatmap Section */}
            <CardSpotlight
              className="bg-[#1a1b1e]/80 border-white/5 backdrop-blur-sm p-0 transition-all hover:border-purple-500/50"
              color="rgba(168, 85, 247, 0.15)"
            >
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Heatmap days={heatmapDays} />
              </CardContent>
            </CardSpotlight>

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
                    <h3 className="text-4xl font-bold text-white">
                      {user.currentStreak}{" "}
                      <span className="text-xl text-gray-500 font-normal">
                        Days
                      </span>
                    </h3>
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
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base text-white">
                        Daily Reminders
                      </Label>
                      <p className="text-xs text-gray-400">
                        Get notified via email
                      </p>
                    </div>
                    <Switch
                      checked={remindersEnabled}
                      onCheckedChange={setRemindersEnabled}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">
                      Reminder Time
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                      <Input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => handleUpdateSettings(e.target.value)}
                        className="pl-9 bg-zinc-800 border-zinc-700 text-white w-full h-10 block"
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

              {/* Bar Chart: Topics */}
              <CardSpotlight
                className="bg-[#1a1b1e]/80 border-white/5 backdrop-blur-sm p-0 transition-all hover:border-purple-500/50"
                color="rgba(168, 85, 247, 0.15)"
              >
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <BarIcon className="h-4 w-4 text-blue-500" />
                    Top 5 Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    <ChartContainer
                      config={{
                        count: { label: "Problems", color: "hsl(217 91% 60%)" }, // blue-500
                      }}
                      className="h-full w-full"
                    >
                      <BarChart
                        data={topicData}
                        layout="vertical"
                        margin={{ left: 0 }}
                      >
                        <YAxis
                          dataKey="name"
                          type="category"
                          tickLine={false}
                          axisLine={false}
                          width={100}
                          tick={{ fill: "#9CA3AF", fontSize: 11 }}
                        />
                        <XAxis type="number" hide />
                        <ChartTooltip
                          cursor={{ fill: "rgba(255,255,255,0.05)" }}
                          content={<ChartTooltipContent />}
                        />
                        <Bar
                          dataKey="count"
                          fill="var(--color-count)"
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                        />
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
    </div>
  );
}
