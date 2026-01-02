import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "./route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import type { User, DailyLog, ProblemLog } from "@prisma/client";

type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  isOnboarded: boolean;
};

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    dailyLog: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
    problemLog: {
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/api-utils", () => ({
  getAuthUser: vi.fn(),
  handleApiError: vi.fn(
    (err) =>
      new Response(JSON.stringify({ error: err.message }), { status: 500 })
  ),
  successResponse: vi.fn(
    (data, status = 200) => new Response(JSON.stringify(data), { status })
  ),
}));

vi.mock("@/lib/streak", () => ({
  updateStreakOnProblemLog: vi.fn(),
  updateStreakOnProblemDelete: vi.fn(),
}));

vi.mock("@/lib/cache", () => ({
  revalidateDashboard: vi.fn(),
  revalidateUserProfile: vi.fn(),
}));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/gems", () => ({
  getGemsForDifficulty: vi.fn(() => 10),
  calculateGemsForStreak: vi.fn(() => ({ total: 0, milestone: null })),
  GEMS_CONFIG: { FREEZE_COST: 50 },
}));

import { getAuthUser } from "@/lib/api-utils";

describe("Problems API", () => {
  const userId = "user-123";
  const mockUser = {
    id: userId,
    email: "test@example.com",
    timezone: "UTC",
    isOnboarded: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthUser).mockResolvedValue(
      mockUser as unknown as SessionUser
    );
  });

  describe("POST", () => {
    it("creates a problem log successfully", async () => {
      const body = {
        name: "Two Sum",
        difficulty: "EASY",
        topic: "ARRAYS",
        tags: ["array"],
      };

      const req = new NextRequest("http://localhost:3000/api/problems", {
        method: "POST",
        body: JSON.stringify(body),
      });

      // Mock DB responses
      vi.mocked(db.user.findUnique).mockResolvedValue(
        mockUser as unknown as User
      );
      vi.mocked(db.dailyLog.upsert).mockResolvedValue({
        id: "log-123",
      } as unknown as DailyLog);
      vi.mocked(db.problemLog.count).mockResolvedValue(0); // Under limit
      vi.mocked(db.problemLog.create).mockResolvedValue({
        id: "problem-123",
        ...body,
      } as unknown as ProblemLog);
      vi.mocked(db.user.update).mockResolvedValue({
        gems: 10,
        currentStreak: 1,
      } as unknown as User);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.problem.name).toBe("Two Sum");
      expect(db.problemLog.create).toHaveBeenCalled();
    });

    it("enforces default daily limit of 2", async () => {
      const body = { name: "Two Sum", difficulty: "EASY", topic: "ARRAYS" };
      const req = new NextRequest("http://localhost:3000/api/problems", {
        method: "POST",
        body: JSON.stringify(body),
      });

      vi.mocked(db.user.findUnique).mockResolvedValue(
        mockUser as unknown as User
      );
      vi.mocked(db.dailyLog.upsert).mockResolvedValue({
        id: "log-123",
      } as unknown as DailyLog);
      vi.mocked(db.problemLog.count).mockResolvedValue(2); // Limit reached

      const response = await POST(req);
      expect(response.status).toBe(500); // ProblemLimitError
    });

    it("respects custom daily limit", async () => {
      const body = { name: "Two Sum", difficulty: "EASY", topic: "ARRAYS" };
      const req = new NextRequest("http://localhost:3000/api/problems", {
        method: "POST",
        body: JSON.stringify(body),
      });

      // Mock user with limit 5
      vi.mocked(db.user.findUnique).mockResolvedValue({
        ...mockUser,
        dailyProblemLimit: 5,
      } as unknown as User);

      vi.mocked(db.dailyLog.upsert).mockResolvedValue({
        id: "log-123",
      } as unknown as DailyLog);
      vi.mocked(db.problemLog.count).mockResolvedValue(2); // Limit NOT reached yet (2 < 5)

      // Should succeed
      vi.mocked(db.problemLog.create).mockResolvedValue({
        id: "problem-123",
        ...body,
      } as unknown as ProblemLog);
      vi.mocked(db.user.update).mockResolvedValue({
        gems: 10,
        currentStreak: 1,
      } as unknown as User);

      const response = await POST(req);
      expect(response.status).toBe(201);
    });

    it("enforces custom daily limit", async () => {
      const body = { name: "Two Sum", difficulty: "EASY", topic: "ARRAYS" };
      const req = new NextRequest("http://localhost:3000/api/problems", {
        method: "POST",
        body: JSON.stringify(body),
      });

      // Mock user with limit 1
      vi.mocked(db.user.findUnique).mockResolvedValue({
        ...mockUser,
        dailyProblemLimit: 1,
      } as unknown as User);

      vi.mocked(db.dailyLog.upsert).mockResolvedValue({
        id: "log-123",
      } as unknown as DailyLog);
      vi.mocked(db.problemLog.count).mockResolvedValue(1); // Limit reached (1 >= 1)

      const response = await POST(req);
      expect(response.status).toBe(500); // ProblemLimitError
    });
  });

  describe("GET", () => {
    it("returns problems for today", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue(
        mockUser as unknown as User
      );
      vi.mocked(db.dailyLog.findUnique).mockResolvedValue({
        problems: [
          {
            id: "p1",
            name: "P1",
            topic: "ARRAYS",
            difficulty: "EASY",
            tags: [],
          },
        ],
      } as unknown as DailyLog & { problems: ProblemLog[] });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.problems).toHaveLength(1);
      expect(data.problems[0].name).toBe("P1");
    });
  });

  describe("PATCH", () => {
    it("updates a problem log", async () => {
      const body = { id: "p1", name: "Updated P1", difficulty: "MEDIUM" };
      const req = new NextRequest("http://localhost:3000/api/problems", {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      vi.mocked(db.user.findUnique).mockResolvedValue(
        mockUser as unknown as User
      );
      vi.mocked(db.problemLog.findUnique).mockResolvedValue({
        id: "p1",
        dailyLog: { userId: userId },
        topic: "ARRAYS",
      } as unknown as ProblemLog & { dailyLog: DailyLog });
      vi.mocked(db.problemLog.update).mockResolvedValue({
        ...body,
      } as unknown as ProblemLog);

      const { PATCH } = await import("./route");
      const response = await PATCH(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.problem.name).toBe("Updated P1");
    });
  });

  describe("DELETE", () => {
    it("deletes a problem log", async () => {
      const req = new NextRequest("http://localhost:3000/api/problems?id=p1", {
        method: "DELETE",
      });

      vi.mocked(db.user.findUnique).mockResolvedValue(
        mockUser as unknown as User
      );
      vi.mocked(db.problemLog.findUnique).mockResolvedValue({
        id: "p1",
        dailyLogId: "log-1",
        dailyLog: { userId: userId, date: new Date() },
      } as unknown as ProblemLog & { dailyLog: DailyLog });
      vi.mocked(db.problemLog.delete).mockResolvedValue({
        id: "p1",
      } as unknown as ProblemLog);
      vi.mocked(db.problemLog.count).mockResolvedValue(0);

      const { DELETE } = await import("./route");
      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.deleted).toBe(true);
    });
  });
});
