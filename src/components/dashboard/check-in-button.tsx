"use client";

import { Check, Circle, X } from "lucide-react";

interface CheckInButtonProps {
  completed: boolean;
}

export function CheckInButton({ completed }: CheckInButtonProps) {
  if (completed) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        <Check className="h-4 w-4" />
        <span className="font-semibold text-sm">Daily Goal Complete</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-500/10 text-gray-400 border border-gray-500/20"
      title="Log a problem to complete streak"
    >
      <Circle className="h-4 w-4" />
      <span className="font-semibold text-sm">Daily Goal: Pending</span>
    </div>
  );
}
