"use client";

import { useState, useMemo, useRef, useEffect, memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Heatmap } from "@/components/heatmap/heatmap";
import { ActivityCharts } from "@/components/dashboard/activity-charts";
import { TimeHeatmap } from "@/components/dashboard/time-heatmap";
import { format, subDays, parseISO } from "date-fns";
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
import {
  Flame,
  ArrowRight,
  Zap,
  Shield,
  Gem,
  Bell,
  History as HistoryIcon,
  Calendar as CalendarIcon,
  PieChart as PieIcon,
  Hash as Tag,
  CheckCircle2,
} from "lucide-react";

// Better seeded random (MurmurHash3-like avalanche) to ensure good distribution
function seededRandom(seed: number) {
  let h = Math.imul(seed ^ 0xdeadbeef, 2654435761);
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Generate sample heatmap data for a full year - showcasing all states
function generateSampleHeatmapData() {
  const days: Array<{
    date: string;
    completed: boolean;
    isFrozen: boolean;
    isMilestone: boolean;
    problemCount: number;
    problems: Array<{
      id: string;
      name: string;
      topic: string;
      difficulty: string;
      externalUrl: null;
      tags: string[];
      hour: number;
    }>;
    completedAtHour: number | null;
  }> = [];

  // Use current year for demo to match the heatmap display
  const demoYear = new Date().getFullYear();
  const problemNames = [
    "Two Sum",
    "Valid Parentheses",
    "Merge Intervals",
    "LRU Cache",
    "Binary Search",
    "Linked List Cycle",
    "Trapping Rain Water",
    "Meeting Rooms II",
    "Word Search",
    "Number of Islands",
  ];
  const topics = [
    "ARRAYS",
    "STRINGS",
    "TREES",
    "GRAPHS",
    "DYNAMIC_PROGRAMMING",
    "LINKED_LISTS",
    "BACKTRACKING",
    "DESIGN",
  ];
  const difficulties = ["EASY", "MEDIUM", "HARD"];

  // Generate data for entire demo year using nested loops (robust)
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(demoYear, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(demoYear, month, day);
      const dateStr = format(date, "yyyy-MM-dd");

      // Robust day of year calculation
      const startOfYear = new Date(demoYear, 0, 1);
      const diffTime = Math.abs(date.getTime() - startOfYear.getTime());
      const dayOfYear = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Use a unique seed for each day
      // Add a large large offset to ensure we're away from 0-ish artifacts
      const seed = dayOfYear * 1000 + month * 100 + day;

      const r1 = seededRandom(seed);
      const r2 = seededRandom(seed + 12345);
      const r3 = seededRandom(seed + 67890);

      // Patterns
      // Base chance of completion: 70%
      // Add some "streakiness" - use sine wave to create busy/quiet weeks
      const seasonal = (Math.sin(dayOfYear / 20) + 1) / 2; // 0 to 1
      const probability = 0.5 + seasonal * 0.4; // 0.5 to 0.9 depending on 'season'

      const isCompleted = r1 < probability;

      // Frozen: rare (3%), only if completed
      const isFrozen = isCompleted && r2 < 0.03;

      // Milestone: rare (2%), only if completed and not frozen
      const isMilestone = isCompleted && !isFrozen && r3 < 0.02;

      // Problem Count
      // Bias towards 1-3 problems
      let numProblems = 1;
      if (r2 > 0.9) numProblems = 5;
      else if (r2 > 0.75) numProblems = 4;
      else if (r2 > 0.5) numProblems = 3;
      else if (r2 > 0.2) numProblems = 2;

      // Ensure we have 0 problems if not completed
      const finalNumProblems = isCompleted ? numProblems : 0;

      const problems =
        isCompleted && finalNumProblems > 0
          ? Array.from({ length: finalNumProblems }, (_, idx) => ({
            id: `${dateStr}-${idx}`,
            name: problemNames[
              Math.floor(seededRandom(seed + idx * 10) * problemNames.length)
            ],
            topic:
              topics[
              Math.floor(seededRandom(seed + idx * 20) * topics.length)
              ],
            difficulty:
              difficulties[
              Math.floor(
                seededRandom(seed + idx * 30) * difficulties.length
              )
              ],
            externalUrl: null as null,
            tags: ["DSA", "Practice"],
            hour: ((dayOfYear + idx) % 14) + 8,
          }))
          : [];

      days.push({
        date: dateStr,
        completed: isCompleted,
        isFrozen: isFrozen,
        isMilestone: isMilestone,
        problemCount: finalNumProblems,
        problems,
        completedAtHour: isCompleted ? (dayOfYear % 14) + 8 : null,
      });
    }
  }

  // Debugging: Log data to console so user can verify in browser
  console.log(
    "Generated Heatmap Data:",
    days.length,
    "days with",
    days.filter((d) => d.completed).length,
    "completed"
  );

  return days;
}

// Generate sample activity data for line chart
function generateSampleActivityData() {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i);
    const seed = i * 500;
    data.push({
      date: format(date, "yyyy-MM-dd"),
      problems: Math.floor(seededRandom(seed) * 3) + 1,
      checkInTime: `${Math.floor(seededRandom(seed + 1) * 12) + 8}:${String(
        Math.floor(seededRandom(seed + 2) * 60)
      ).padStart(2, "0")}`,
    });
  }
  return data;
}

// Sample difficulty data for pie chart
const sampleDifficultyData = [
  { name: "EASY", value: 45, color: "#10B981" },
  { name: "MEDIUM", value: 32, color: "#F59E0B" },
  { name: "HARD", value: 12, color: "#EF4444" },
];

// Sample topic data for bar chart
const sampleTopicData = [
  { name: "Arrays", count: 24 },
  { name: "Strings", count: 18 },
  { name: "Trees", count: 15 },
  { name: "DP", count: 12 },
  { name: "Graphs", count: 8 },
];

export default function LandingPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Data generation is memoized for performance

  // Generate data with seeded random (consistent SSR/client)
  const heatmapDays = useMemo(() => {
    console.log("Generating heatmap data memo...");
    return generateSampleHeatmapData();
  }, []);
  const activityData = useMemo(() => generateSampleActivityData(), []);

  const selectedDayData = useMemo(() => heatmapDays.find((d) => d.date === selectedDate), [heatmapDays, selectedDate]);
  const selectedDayProblems = useMemo(() => selectedDayData?.problems || [], [selectedDayData]);

  const dayDistribution = useMemo(() => {
    if (!selectedDayData) return [];
    const dist: Record<number, number> = {};
    // Only count problems, not check-in time
    selectedDayProblems.forEach((p) => {
      dist[p.hour] = (dist[p.hour] || 0) + 1;
    });
    const dayOfWeek = selectedDayData.date
      ? parseISO(selectedDayData.date).getDay()
      : 0;
    return Object.entries(dist).map(([hour, count]) => ({
      hour: Number(hour),
      dayOfWeek,
      count,
    }));
  }, [selectedDayData, selectedDayProblems]);

  const totalProblems = sampleDifficultyData.reduce((a, b) => a + b.value, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Static Background - GPU layer isolated with will-change */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      >
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-900/20 rounded-full blur-[60px]" />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden z-10">
        <nav className="flex items-center justify-between p-4 md:p-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <Flame className="h-7 w-7 text-orange-500" />
            <span className="text-lg font-bold">StreakDSA</span>
          </div>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30 border-0">
              Get Started <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </nav>

        <div className="text-center py-16 px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 rounded-full border border-orange-500/20 mb-6">
              <Zap className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs text-orange-400">
                DSA accountability that works
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5">
              Build Unbreakable
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">
                DSA Streaks
              </span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              The accountability platform that makes skipping DSA
              psychologically harder than doing it.
            </p>
            <Link href="/login">
              <Button
                size="lg"
                className="h-12 px-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/40 border-0 group"
              >
                <Flame className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Ready to Commit
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Smart Notifications Highlight */}
      <section className="relative z-10 py-24 px-6 max-w-5xl mx-auto">
        <div className="bg-zinc-950/40 border border-white/5 rounded-3xl p-8 md:p-12 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                Accountability
              </div>
              <h2 className="text-3xl font-bold leading-tight">
                Reminders that <span className="text-orange-500">won&apos;t let you fail</span>
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Life gets busy. We stay on top of your goals with multi-channel alerts.
                Whether it&apos;s a gentle morning email or an urgent late-night push,
                we ensure you never break your streak.
              </p>
              <ul className="space-y-3">
                {[
                  "Native Web Push Notifications",
                  "Personalized Email Reminders",
                  "Fixed Schedule Accountability",
                  "Custom Timezone Syncing"
                ].map((item, id) => (
                  <li key={id} className="flex items-center gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-orange-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative flex justify-center">
              {/* Notification Mockup Animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[300px] aspect-[9/16] bg-zinc-900 rounded-[3rem] border-[6px] border-zinc-800 p-4 shadow-2xl relative overflow-hidden"
              >
                {/* Screen content */}
                <div className="w-1/3 h-6 bg-zinc-800 rounded-full mx-auto mb-10" />

                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
                  className="bg-zinc-800/90 rounded-2xl p-4 border border-white/10 shadow-lg mb-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Flame className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-white">StreakDSA</div>
                      <div className="text-[8px] text-zinc-400">Reminders • Just now</div>
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-white mb-1">⏰ Streak at Risk!</div>
                  <div className="text-[9px] text-zinc-400">Don&apos;t break your 42-day streak. Solve 2 problems now!</div>
                </motion.div>

                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
                  className="bg-zinc-800/90 rounded-2xl p-4 border border-white/10 shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Gem className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-white">StreakDSA</div>
                      <div className="text-[8px] text-zinc-400">Milestone • 10m ago</div>
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-white mb-1">🎉 10 Day Milestone</div>
                  <div className="text-[9px] text-zinc-400">You&apos;ve earned 50 bonus gems! Keep going.</div>
                </motion.div>

                <div className="absolute inset-x-0 bottom-4 flex justify-center">
                  <div className="w-1/2 h-1 bg-zinc-700 rounded-full" />
                </div>
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute -z-10 w-full h-full bg-orange-500/5 blur-3xl rounded-full translate-y-12" />
            </div>
          </div>
        </div>
      </section>

      {/* Heatmap Section */}
      <section className="relative z-10 py-24 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12">
          Your Activity at a Glance
        </h2>

        {/* Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <CardSpotlight
            className="p-6 transition-all hover:border-purple-500/50"
            color="rgba(168, 85, 247, 0.15)"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HistoryIcon className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium">Activity Log</span>
              </div>
              {!selectedDate && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-xs text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20"
                >
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-2 h-2 rounded-full bg-purple-400"
                  />
                  Click any day to explore
                </motion.div>
              )}
            </div>
            <Heatmap
              days={heatmapDays}
              onDayClick={setSelectedDate}
              selectedDate={selectedDate}
            />
          </CardSpotlight>
        </motion.div>

        {/* Day Details */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-purple-400" />
                Activity for {format(parseISO(selectedDate), "MMMM d, yyyy")}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(null)}
              >
                Clear
              </Button>
            </div>

            {selectedDayProblems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {selectedDayProblems.map((p) => (
                  <CardSpotlight
                    key={p.id}
                    className="p-4 bg-zinc-900/50 border-white/5"
                  >
                    <div className="flex justify-between items-start mb-2">
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
                    <h4 className="text-sm font-medium mb-1">{p.name}</h4>
                    <p className="text-[10px] text-muted-foreground">
                      {p.topic.replace(/_/g, " ")}
                    </p>
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

            <TimeHeatmap
              data={dayDistribution}
              highlightDayOnly={true}
              problems={selectedDayProblems}
            />
          </motion.div>
        )}
      </section>

      {/* Metrics Section */}
      <section className="relative z-10 py-24 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12">
          Deep Dive into Your Stats
        </h2>

        <div className="space-y-12">
          {/* Activity Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ActivityCharts data={activityData} />
          </motion.div>

          {/* Statistics Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Pie Chart */}
            <CardSpotlight className="p-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieIcon className="h-4 w-4 text-emerald-500" />
                  Problems by Difficulty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ChartContainer
                    config={{
                      EASY: { label: "Easy", color: "hsl(142.1 76.2% 36.3%)" },
                      MEDIUM: { label: "Medium", color: "hsl(32 95% 44%)" },
                      HARD: { label: "Hard", color: "hsl(0 84% 60%)" },
                    }}
                    className="h-full w-full"
                  >
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={sampleDifficultyData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        strokeWidth={5}
                      >
                        {sampleDifficultyData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="rgba(0,0,0,0.5)"
                          />
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
                                    className="fill-foreground text-2xl font-bold"
                                  >
                                    {totalProblems}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 20}
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
                  {sampleDifficultyData.map((d) => (
                    <div
                      key={d.name}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
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

            {/* Bar Chart */}
            <CardSpotlight className="p-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-4 w-4 text-purple-500" />
                  Top 5 Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ChartContainer
                    config={{
                      count: { label: "Problems", color: "hsl(262 83% 58%)" },
                    }}
                    className="h-full w-full"
                  >
                    <BarChart
                      data={sampleTopicData}
                      layout="vertical"
                      margin={{ left: 60 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                      />
                      <Bar
                        dataKey="count"
                        fill="hsl(262 83% 58%)"
                        radius={4}
                        barSize={20}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </CardSpotlight>
          </motion.div>

          {/* Metrics Grid Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Streak Card */}
            <Card className="bg-gradient-to-br from-[#1a1b1e] to-[#0f1012] border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-16 bg-orange-500/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:bg-orange-500/10 transition-colors" />
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                    <Flame className="h-6 w-6 text-orange-500 fill-orange-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                      Current Streak
                    </p>
                    <div className="flex items-baseline gap-1">
                      <h2 className="text-3xl font-bold tracking-tight text-white">42</h2>
                      <span className="text-muted-foreground text-sm font-medium">
                        days
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Problems Card */}
            <Card className="bg-gradient-to-br from-[#1a1b1e] to-[#0f1012] border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-16 bg-emerald-500/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                      Solutions Logged
                    </p>
                    <div className="flex items-baseline gap-1">
                      <h2 className="text-3xl font-bold tracking-tight text-white">{totalProblems}</h2>
                      <span className="text-muted-foreground text-sm font-medium">
                        solved
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gems Card */}
            <Card className="bg-gradient-to-br from-[#1a1b1e] to-[#0f1012] border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-16 bg-amber-500/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                    <Gem className="h-6 w-6 text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                      Gems Collected
                    </p>
                    <div className="flex items-baseline gap-1">
                      <h2 className="text-3xl font-bold tracking-tight text-white">1,250</h2>
                      <span className="text-muted-foreground text-sm font-medium">
                        earned
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Summary */}
      <section className="relative z-10 py-24 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Shield,
              title: "Commitment Lock",
              desc: "Accountability that sticks",
            },
            {
              icon: Flame,
              title: "Streak System",
              desc: "Build daily consistency",
            },
            {
              icon: Bell,
              title: "Smart Reminders",
              desc: "Push & email alerts",
            },
            {
              icon: Gem,
              title: "Gems & Rewards",
              desc: "Gamified progress",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-5 rounded-xl bg-card border border-border hover:border-orange-500/30 transition-colors group"
            >
              <f.icon className="h-7 w-7 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Reorganized CTA */}
      <section className="relative z-10 py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-b from-zinc-900 to-black border border-white/5 rounded-[2rem] p-12 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px]" />

          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center justify-center p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20 mb-2">
              <Flame className="h-10 w-10 text-orange-500" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Don&apos;t Just Learn. <br />
                <span className="text-orange-500">Stay Consistent.</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Join the growing community of developers building unbreakable
                DSA streaks with our smart accountability system.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/login">
                <Button
                  size="xl"
                  className="h-14 px-10 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl shadow-orange-500/20 border-0 text-lg font-bold group"
                >
                  Start Your Streak Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Free to Start
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                No Credit Card
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Flame className="h-4 w-4" />
            <span>StreakDSA by</span>
            <a
              href="https://shantanukudva.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-orange-500 transition-colors"
            >
              Shantanu Kudva
            </a>
            <span className="text-muted-foreground/50">|</span>
            <a
              href="https://www.linkedin.com/in/shantanu-kudva"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
          </div>
          <div className="flex gap-5 text-xs text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div >
  );
}
