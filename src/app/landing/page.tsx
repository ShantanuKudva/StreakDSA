"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Flame,
  Target,
  Gem,
  Github,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Calendar,
  TrendingUp,
  Play,
  Pause,
} from "lucide-react";

// Interactive Heatmap Component
function DemoHeatmap() {
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);
  const [hoveredCell, setHoveredCell] = useState<{
    week: number;
    day: number;
  } | null>(null);

  useEffect(() => {
    // Generate random heatmap data (12 weeks x 7 days)
    const data = Array.from({ length: 12 }, () =>
      Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
    );
    setHeatmapData(data);
  }, []);

  const handleCellClick = (week: number, day: number) => {
    const newData = [...heatmapData];
    newData[week][day] = (newData[week][day] + 1) % 5;
    setHeatmapData(newData);
  };

  const getColor = (value: number) => {
    const colors = [
      "bg-slate-800",
      "bg-emerald-900/50",
      "bg-emerald-700/60",
      "bg-emerald-500/70",
      "bg-emerald-400",
    ];
    return colors[value];
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-300">Activity Heatmap</h3>
        <span className="text-xs text-slate-500">Click cells to change</span>
      </div>
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 mr-2">
          {days.map((day, i) => (
            <div
              key={day}
              className="h-3 text-[10px] text-slate-500 flex items-center"
            >
              {i % 2 === 1 ? day : ""}
            </div>
          ))}
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {heatmapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((value, dayIndex) => (
                <motion.div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm cursor-pointer ${getColor(
                    value
                  )} hover:ring-1 hover:ring-white/30`}
                  onClick={() => handleCellClick(weekIndex, dayIndex)}
                  onHoverStart={() =>
                    setHoveredCell({ week: weekIndex, day: dayIndex })
                  }
                  onHoverEnd={() => setHoveredCell(null)}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {hoveredCell && (
        <div className="mt-3 text-xs text-slate-400">
          Week {hoveredCell.week + 1}, {days[hoveredCell.day]}:{" "}
          {heatmapData[hoveredCell.week]?.[hoveredCell.day]} problems
        </div>
      )}
      <div className="flex items-center justify-end gap-1 mt-4 text-[10px] text-slate-500">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${getColor(i)}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

// Interactive Progress Graph
function DemoProgressGraph() {
  const [data, setData] = useState<number[]>([
    3, 5, 2, 8, 6, 9, 4, 7, 10, 8, 12, 15,
  ]);
  const [isAnimating, setIsAnimating] = useState(false);

  const maxValue = Math.max(...data);
  const graphHeight = 120;

  const animateNewData = () => {
    setIsAnimating(true);
    const newData = data.map(() => Math.floor(Math.random() * 15) + 1);
    setData(newData);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-slate-300">
            Streak Progress
          </h3>
          <p className="text-xs text-slate-500">Last 12 weeks</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={animateNewData}
          className="text-xs"
        >
          <TrendingUp className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>
      <div className="relative" style={{ height: graphHeight }}>
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {data.map((value, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t cursor-pointer hover:from-orange-400 hover:to-orange-300"
              initial={{ height: 0 }}
              animate={{ height: `${(value / maxValue) * 100}%` }}
              transition={{ duration: 0.5, delay: isAnimating ? i * 0.05 : 0 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => {
                const newData = [...data];
                newData[i] = Math.min(15, newData[i] + 1);
                setData(newData);
              }}
            />
          ))}
        </div>
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-t border-slate-700/50 w-full" />
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-slate-500">
        <span>Week 1</span>
        <span>Week 12</span>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-500" />
          <span className="text-slate-400">Problems Solved</span>
        </div>
        <span className="text-orange-400 font-medium">
          {data.reduce((a, b) => a + b, 0)} total
        </span>
      </div>
    </div>
  );
}

// Time Progress / Countdown Demo
function DemoTimeProgress() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 42,
    seconds: 18,
  });
  const [isRunning, setIsRunning] = useState(true);
  const [problemsDone, setProblemsDone] = useState(1);
  const dailyGoal = 2;

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const totalSeconds =
    timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
  const maxSeconds = 24 * 3600;
  const progress = ((maxSeconds - totalSeconds) / maxSeconds) * 100;

  return (
    <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-300">Daily Deadline</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsRunning(!isRunning)}
          className="h-8 w-8 p-0"
        >
          {isRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Circular Progress */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 56}
            animate={{
              strokeDashoffset: 2 * Math.PI * 56 * (1 - progress / 100),
            }}
            transition={{ duration: 0.5 }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white font-mono">
            {String(timeLeft.hours).padStart(2, "0")}:
            {String(timeLeft.minutes).padStart(2, "0")}
          </span>
          <span className="text-xs text-slate-400">remaining</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Today&apos;s Progress</span>
          <span className="text-orange-400">
            {problemsDone}/{dailyGoal} problems
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
            animate={{ width: `${(problemsDone / dailyGoal) * 100}%` }}
          />
        </div>
        <Button
          size="sm"
          className="w-full mt-3"
          onClick={() => setProblemsDone((p) => Math.min(dailyGoal, p + 1))}
          disabled={problemsDone >= dailyGoal}
        >
          {problemsDone >= dailyGoal ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Goal Complete!
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              Log Problem (+1)
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Demo Login Component (Simplified)
function DemoLoginCard() {
  const [demoClicked, setDemoClicked] = useState<string | null>(null);

  const handleDemoClick = (provider: string) => {
    setDemoClicked(provider);
    setTimeout(() => setDemoClicked(null), 1500);
  };

  return (
    <Card className="w-full max-w-sm mx-auto shadow-2xl border-slate-700/50 bg-slate-900/80 backdrop-blur">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-white text-lg">Sign In</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={() => handleDemoClick("google")}
          variant="outline"
          className="w-full h-10 text-sm relative overflow-hidden"
        >
          <AnimatePresence>
            {demoClicked === "google" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 20 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-green-500/20 rounded-full"
              />
            )}
          </AnimatePresence>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {demoClicked === "google" ? "✓ Success" : "Continue with Google"}
        </Button>

        <Button
          onClick={() => handleDemoClick("github")}
          variant="outline"
          className="w-full h-10 text-sm"
        >
          <Github className="mr-2 h-4 w-4" />
          {demoClicked === "github" ? "✓ Success" : "Continue with GitHub"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-900/20 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[80px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Flame className="h-8 w-8 text-orange-500" />
          <span className="text-xl font-bold">StreakDSA</span>
        </div>
        <Link href="/login">
          <Button>
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 text-center py-16 px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-full border border-orange-500/20 mb-6">
            <Zap className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-orange-400">
              Make DSA a habit, not a chore
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Build Unbreakable
            <br />
            DSA Streaks
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            The accountability platform that makes skipping DSA psychologically
            harder than doing it.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8">
                Start Your Pledge <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-12 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: "Commitment Lock",
              desc: "Set a pledge you can't easily break.",
            },
            {
              icon: Flame,
              title: "Streak Fire",
              desc: "Watch your streak grow daily.",
            },
            {
              icon: Gem,
              title: "Earn Gems",
              desc: "Collect gems for consistency.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800"
            >
              <feature.icon className="h-8 w-8 text-orange-500 mb-3" />
              <h3 className="text-base font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interactive Demos */}
      <section
        id="demos"
        className="relative z-10 py-16 px-6 max-w-7xl mx-auto"
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          Interactive Demos
        </h2>
        <p className="text-slate-400 text-center mb-10 text-sm">
          Click around – fully interactive!
        </p>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-400 text-center">
              📊 Activity Heatmap
            </h3>
            <DemoHeatmap />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-400 text-center">
              📈 Progress Graph
            </h3>
            <DemoProgressGraph />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-400 text-center">
              ⏰ Time Progress
            </h3>
            <DemoTimeProgress />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-400 text-center">
              🔐 Quick Login
            </h3>
            <DemoLoginCard />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-16 px-6 text-center">
        <div className="max-w-xl mx-auto bg-gradient-to-r from-orange-500/10 to-purple-500/10 rounded-2xl p-10 border border-slate-800">
          <h2 className="text-2xl font-bold mb-3">Ready to Commit?</h2>
          <p className="text-slate-400 mb-6 text-sm">
            Join developers building consistent DSA habits.
          </p>
          <Link href="/login">
            <Button size="lg" className="h-12 px-8">
              Start Your Free Pledge <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Flame className="h-4 w-4" />
            <span>StreakDSA by Shantanu Kudva</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/terms" className="hover:text-slate-300">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-slate-300">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
