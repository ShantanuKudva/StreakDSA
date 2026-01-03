"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
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
  History as HistoryIcon,
  Calendar as CalendarIcon,
  PieChart as PieIcon,
  Hash as Tag,
  CheckCircle2,
} from "lucide-react";

// Seeded random for consistent SSR/client
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Generate sample heatmap data for a full year
function generateSampleHeatmapData() {
  const days = [];
  const today = new Date();
  const problemNames = [
    "Two Sum",
    "Valid Parentheses",
    "Merge Intervals",
    "LRU Cache",
    "Binary Search",
    "Linked List Cycle",
  ];
  const topics = [
    "ARRAYS",
    "STRINGS",
    "TREES",
    "GRAPHS",
    "DYNAMIC_PROGRAMMING",
    "LINKED_LISTS",
  ];
  const difficulties = ["EASY", "MEDIUM", "HARD"];

  for (let i = 365; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const seed = i * 1000;
    const completed = seededRandom(seed) > 0.3;
    const isMilestone = completed && (i === 7 || i === 30 || i === 60);
    const isFrozen = !completed && seededRandom(seed + 1) > 0.9;

    const numProblems = completed
      ? Math.floor(seededRandom(seed + 2) * 2) + 1
      : 0;
    const problems = completed
      ? Array.from({ length: numProblems }, (_, idx) => ({
          id: `${dateStr}-${idx}`,
          name: problemNames[
            Math.floor(seededRandom(seed + idx + 10) * problemNames.length)
          ],
          topic:
            topics[Math.floor(seededRandom(seed + idx + 20) * topics.length)],
          difficulty:
            difficulties[
              Math.floor(seededRandom(seed + idx + 30) * difficulties.length)
            ],
          externalUrl: null,
          tags: ["DSA", "Practice"],
          hour: Math.floor(seededRandom(seed + idx + 40) * 14) + 8,
        }))
      : [];

    days.push({
      date: dateStr,
      completed,
      isFrozen,
      isMilestone,
      problems,
      completedAtHour: completed
        ? Math.floor(seededRandom(seed + 100) * 14) + 8
        : null,
    });
  }
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -300]);

  // Generate data with seeded random (consistent SSR/client)
  const heatmapDays = useMemo(() => generateSampleHeatmapData(), []);
  const activityData = useMemo(() => generateSampleActivityData(), []);

  const selectedDayData = heatmapDays.find((d) => d.date === selectedDate);
  const selectedDayProblems = selectedDayData?.problems || [];

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
    <div
      ref={containerRef}
      className="min-h-screen bg-background text-foreground"
    >
      {/* Parallax Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          style={{ y: y1 }}
          className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px]"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-900/20 rounded-full blur-[80px]"
        />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden z-10">
        <nav className="flex items-center justify-between p-4 md:p-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Flame className="h-7 w-7 text-orange-500" />
            <span className="text-lg font-bold">StreakDSA</span>
          </div>
          <Link href="/login">
            <Button>
              Get Started <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </nav>

        <div className="text-center py-16 px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20 mb-6">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-primary">
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
              <Button size="lg" className="h-11 px-7">
                Start Your Pledge <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-12 px-4 max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: Shield,
              title: "Commitment Lock",
              desc: "Set pledges you can't break",
            },
            {
              icon: Flame,
              title: "Streak Fire",
              desc: "Watch your streak grow",
            },
            { icon: Gem, title: "Earn Gems", desc: "Rewards for consistency" },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-5 rounded-xl bg-card border border-border"
            >
              <f.icon className="h-7 w-7 text-primary mb-3" />
              <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="relative z-10 py-12 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">
          Track Your Progress Like a Pro
        </h2>

        <div className="space-y-6">
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
              className="space-y-6"
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

          {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-[#1a1b1e] to-[#0f1012] border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                    <Flame className="h-8 w-8 text-orange-500 fill-orange-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
                      Current Streak
                    </p>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-5xl font-bold tracking-tight">42</h2>
                      <span className="text-muted-foreground font-medium">
                        days
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Max: 75 days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto bg-card rounded-2xl p-10 border border-border"
        >
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Ready to Commit?</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Join developers building consistent DSA habits.
          </p>
          <div className="flex justify-center">
            <Link href="/login">
              <Button size="lg" className="h-11 px-8">
                Start Your Free Pledge <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Flame className="h-4 w-4" />
            StreakDSA by Shantanu Kudva
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
    </div>
  );
}
