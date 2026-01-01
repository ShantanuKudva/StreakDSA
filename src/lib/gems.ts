/**
 * Gems calculation logic
 * Based on LLD Section 4.2 and PRD Section 6.3
 */

export const GEMS_CONFIG = {
  DAILY_COMPLETION: 10,
  STREAK_7_DAYS: 50,
  STREAK_30_DAYS: 200,
  PLEDGE_COMPLETE: 500,
} as const;

export type MilestoneType =
  | "7_DAY_STREAK"
  | "30_DAY_STREAK"
  | "PLEDGE_COMPLETE"
  | null;

export interface GemsResult {
  total: number;
  milestone: MilestoneType;
}

/**
 * Calculate gems to award for a streak
 * @param newStreak The new streak value after check-in
 * @param isPledgeComplete Whether this check-in completes the pledge
 * @returns The total gems and any milestone reached
 */
export function calculateGemsForStreak(
  newStreak: number,
  isPledgeComplete: boolean
): GemsResult {
  let total = GEMS_CONFIG.DAILY_COMPLETION;
  let milestone: MilestoneType = null;

  // Check streak milestones
  if (newStreak === 7) {
    total += GEMS_CONFIG.STREAK_7_DAYS;
    milestone = "7_DAY_STREAK";
  } else if (newStreak === 30) {
    total += GEMS_CONFIG.STREAK_30_DAYS;
    milestone = "30_DAY_STREAK";
  }

  // Check pledge completion (overrides streak milestone in display)
  if (isPledgeComplete) {
    total += GEMS_CONFIG.PLEDGE_COMPLETE;
    milestone = "PLEDGE_COMPLETE";
  }

  return { total, milestone };
}

/**
 * Get the display message for a milestone
 */
export function getMilestoneMessage(milestone: MilestoneType): string | null {
  switch (milestone) {
    case "7_DAY_STREAK":
      return "🔥 7-day streak achieved! +50 bonus gems!";
    case "30_DAY_STREAK":
      return "🔥🔥 30-day streak achieved! +200 bonus gems!";
    case "PLEDGE_COMPLETE":
      return "🎉 Pledge completed! +500 bonus gems! You did it!";
    default:
      return null;
  }
}
