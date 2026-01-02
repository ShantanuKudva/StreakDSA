"use client";

import { Flame, Gem, Trophy, Target } from "lucide-react";

interface ShareCardProps {
  user: {
    name: string | null;
    image: string | null;
  };
  stats: {
    currentStreak: number;
    maxStreak: number;
    totalProblems: number;
    gems: number;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
  };
}

export function ShareCard({ user, stats }: ShareCardProps) {
  return (
    <div
      id="share-card"
      className="w-[360px] p-5 bg-gradient-to-br from-[#0d0d12] via-[#1a1a2e] to-[#0d0d12] rounded-2xl border border-purple-500/30 shadow-2xl"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Header with user info */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold border-2 border-purple-400/50 shadow-lg">
          {(user.name || "U").charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            {user.name || "Anonymous"}
          </h2>
          <p className="text-xs text-purple-400">StreakDSA Grinder 🔥</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Current Streak */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-3 border border-orange-500/30">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-400 fill-orange-400" />
            <div>
              <p className="text-2xl font-black text-white">
                {stats.currentStreak}
              </p>
              <p className="text-[10px] text-orange-400 uppercase">
                Day Streak
              </p>
            </div>
          </div>
        </div>

        {/* Gems */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-3 border border-cyan-500/30">
          <div className="flex items-center gap-2">
            <Gem className="h-5 w-5 text-cyan-400" />
            <div>
              <p className="text-2xl font-black text-white">{stats.gems}</p>
              <p className="text-[10px] text-cyan-400 uppercase">Gems</p>
            </div>
          </div>
        </div>

        {/* Best Streak */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <div>
              <p className="text-xl font-bold text-white">{stats.maxStreak}</p>
              <p className="text-[10px] text-gray-400 uppercase">Best Streak</p>
            </div>
          </div>
        </div>

        {/* Total Problems */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-400" />
            <div>
              <p className="text-xl font-bold text-white">
                {stats.totalProblems}
              </p>
              <p className="text-[10px] text-gray-400 uppercase">Problems</p>
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 text-center py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          <p className="text-lg font-bold text-emerald-400">
            {stats.easyCount}
          </p>
          <p className="text-[9px] text-emerald-400/70 uppercase">Easy</p>
        </div>
        <div className="flex-1 text-center py-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <p className="text-lg font-bold text-amber-400">
            {stats.mediumCount}
          </p>
          <p className="text-[9px] text-amber-400/70 uppercase">Medium</p>
        </div>
        <div className="flex-1 text-center py-2 bg-red-500/10 rounded-lg border border-red-500/20">
          <p className="text-lg font-bold text-red-400">{stats.hardCount}</p>
          <p className="text-[9px] text-red-400/70 uppercase">Hard</p>
        </div>
      </div>

      {/* Footer branding */}
      <div className="flex items-center justify-center gap-2 pt-3 border-t border-white/10">
        <Flame className="h-3 w-3 text-orange-500" />
        <span className="text-xs font-semibold text-gray-400">StreakDSA</span>
        <span className="text-[10px] text-gray-600">• Stay Consistent</span>
      </div>
    </div>
  );
}
