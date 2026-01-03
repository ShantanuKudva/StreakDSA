import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/api-utils", () => ({
  getAuthUser: vi
    .fn()
    .mockResolvedValue({ id: "user-123", email: "test@example.com" }),
  handleApiError: vi.fn((err) => {
    // Simple mock implementation of handleApiError for testing
    return new Response(
      JSON.stringify({ success: false, error: { message: err.message } }),
      { status: 400 }
    );
  }),
  successResponse: vi.fn((data, status) => {
    return new Response(JSON.stringify({ success: true, data }), { status });
  }),
}));

describe("POST /api/user/onboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully onboard a user with valid data", async () => {
    const validBody = {
      name: "Test User",
      pledgeDays: 90,
      reminderTime: "22:00",
      timezone: "America/Los_Angeles",
      emailNotifications: true,
      whatsappNotifications: true,
      smsNotifications: false,
    };

    const req = new NextRequest("http://localhost/api/user/onboard", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    // Mock db response
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      ...validBody,
      startDate: new Date(),
      currentStreak: 0,
      maxStreak: 0,
      gems: 0,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(db.user.update).mockResolvedValue(mockUser as any);

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: expect.objectContaining({
        name: "Test User",
        timezone: "America/Los_Angeles", // Verify timezone is passed correctly
        emailNotifications: true,
        whatsappNotifications: true,
        smsNotifications: false,
      }),
    });
  });

  it("should fail with invalid time format (e.g. 12:00 PM)", async () => {
    // This was the original bug
    const invalidBody = {
      name: "Test User",
      pledgeDays: 90,
      reminderTime: "12:00 PM", // Invalid format
      timezone: "UTC",
    };

    const req = new NextRequest("http://localhost/api/user/onboard", {
      method: "POST",
      body: JSON.stringify(invalidBody),
    });

    const res = await POST(req);
    // Since handleApiError is mocked, we might need to check how validation error propagates.
    // In strict mode, Zod throws. POST catches and calls handleApiError.

    // Actually, handleApiError in real app returns 400/500.
    // If validation fails, logic throws ValidationError, caught by catch block.

    // Let's assume validation failure leads to handleApiError being called.

    // We expect the mocked handleApiError to return 400 or similar.
    expect(res.status).toBe(400);
  });

  it("should respect timezone field", async () => {
    const body = {
      name: "Timezone Tester",
      pledgeDays: 60,
      reminderTime: "10:00",
      timezone: "Asia/Kolkata",
    };

    const req = new NextRequest("http://localhost/api/user/onboard", {
      method: "POST",
      body: JSON.stringify(body),
    });

    vi.mocked(db.user.update).mockResolvedValue({
      ...body,
      id: "u1",
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    await POST(req);

    expect(db.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          timezone: "Asia/Kolkata",
        }),
      })
    );
  });
});
