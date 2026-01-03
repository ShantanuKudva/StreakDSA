/**
 * Zod schemas for API request validation
 * Based on LLD Section 3 and API-SPEC
 */

import { z } from "zod";

// Enums matching Prisma schema
export const TopicSchema = z.enum([
  "BASICS",
  "SORTING",
  "ARRAYS",
  "BINARY_SEARCH",
  "STRINGS",
  "LINKED_LISTS",
  "RECURSION",
  "BIT_MANIPULATION",
  "STACKS_QUEUES",
  "SLIDING_WINDOW",
  "HEAPS",
  "GREEDY",
  "BINARY_TREES",
  "BST",
  "GRAPHS",
  "DYNAMIC_PROGRAMMING",
  "TRIES",
  "OTHER",
]);

export const DifficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);

// Onboarding request
export const OnboardRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional(), // Email might be pre-filled from auth, but allow update
  pledgeDays: z.number().int().min(7).max(365),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
  timezone: z.string().min(1, "Timezone is required"),
  smsPhone: z.string().optional(),
  whatsappPhone: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  whatsappNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
});

export type OnboardRequest = z.infer<typeof OnboardRequestSchema>;

// Problem logging request
export const ProblemRequestSchema = z.object({
  topic: z.string().optional(), // Was strict Enum, now flexible or optional as we use tags
  name: z.string().min(1).max(255),
  difficulty: DifficultySchema,
  externalUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type ProblemRequest = z.infer<typeof ProblemRequestSchema>;

// Settings update request
export const SettingsRequestSchema = z.object({
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
});

export type SettingsRequest = z.infer<typeof SettingsRequestSchema>;

// Topic display names for UI
export const TopicDisplayNames: Record<z.infer<typeof TopicSchema>, string> = {
  BASICS: "Basics & Fundamentals",
  SORTING: "Sorting Techniques",
  ARRAYS: "Arrays",
  BINARY_SEARCH: "Binary Search",
  STRINGS: "Strings",
  LINKED_LISTS: "Linked Lists",
  RECURSION: "Recursion & Backtracking",
  BIT_MANIPULATION: "Bit Manipulation",
  STACKS_QUEUES: "Stacks & Queues",
  SLIDING_WINDOW: "Sliding Window & Two Pointer",
  HEAPS: "Heaps",
  GREEDY: "Greedy",
  BINARY_TREES: "Binary Trees",
  BST: "Binary Search Trees",
  GRAPHS: "Graphs",
  DYNAMIC_PROGRAMMING: "Dynamic Programming",
  TRIES: "Tries",
  OTHER: "Other",
};
