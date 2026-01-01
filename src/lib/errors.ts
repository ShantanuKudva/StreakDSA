/**
 * Custom error classes for StreakDSA
 * Based on LLD Section 7.1
 */

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super("UNAUTHORIZED", message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied") {
    super("FORBIDDEN", message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super("NOT_FOUND", `${resource} not found`, 404);
  }
}

export class AlreadyCheckedInError extends AppError {
  constructor() {
    super("ALREADY_CHECKED_IN", "Today has already been marked complete", 409);
  }
}

export class DeadlinePassedError extends AppError {
  constructor() {
    super("DEADLINE_PASSED", "Check-in deadline for today has passed", 403);
  }
}

export class ProblemLimitError extends AppError {
  constructor() {
    super("PROBLEM_LIMIT_EXCEEDED", "Maximum 2 problems per day allowed", 400);
  }
}

export class UserNotOnboardedError extends AppError {
  constructor() {
    super(
      "USER_NOT_ONBOARDED",
      "Please complete onboarding to set up your pledge",
      403
    );
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: Record<string, string[]>) {
    super("VALIDATION_ERROR", message, 400);
  }
}
