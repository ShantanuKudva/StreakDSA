import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    dailyLog: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
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
    (data) => new Response(JSON.stringify(data), { status: 200 })
  ),
}));

vi.mock("@/lib/data", () => ({
  getDashboardData: vi.fn(),
}));

import { getAuthUser } from "@/lib/api-utils";
import { getDashboardData, type DashboardData } from "@/lib/data";

type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  isOnboarded: boolean;
};

describe("Dashboard API", () => {
  const userId = "user-123";
  const mockUser = { id: userId, email: "test@example.com", isOnboarded: true };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthUser).mockResolvedValue(
      mockUser as unknown as SessionUser
    );
  });

  it("returns dashboard data successfully", async () => {
    const mockData = {
      user: { name: "Test User" },
      streak: { current: 5 },
    };

    vi.mocked(getDashboardData).mockResolvedValue(
      mockData as unknown as DashboardData
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockData);
    expect(getDashboardData).toHaveBeenCalledWith(userId);
  });

  it("handles errors gracefully", async () => {
    vi.mocked(getDashboardData).mockRejectedValue(new Error("DB Error"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("DB Error");
  });
});
