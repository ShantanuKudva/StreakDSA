/**
 * TypeScript type definitions for StreakDSA
 */

import type { User, DailyLog, ProblemLog } from "@prisma/client";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      isOnboarded: boolean;
    };
  }

  interface User {
    isOnboarded?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isOnboarded: boolean;
  }
}

// Dashboard data types matching API-SPEC
export interface DashboardData {
  user: {
    name: string | null;
    email: string;
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
  };
}

// Matrix/Heatmap data types
export interface HeatmapDay {
  date: string;
  completed: boolean;
  isMilestone: boolean;
  milestoneType?: string;
  problems: {
    topic: string;
    difficulty: string;
  }[];
}

export interface MatrixData {
  days: HeatmapDay[];
  topics: Record<string, number>;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// Check-in result type (re-export from streak for consistency)
export type { CheckInResult } from "@/lib/streak";

// User with relations
export type UserWithLogs = User & {
  dailyLogs: (DailyLog & { problems: ProblemLog[] })[];
};
