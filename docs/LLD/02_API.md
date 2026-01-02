# API Implementation Details

## 1. POST /api/user/onboard

- **Purpose**: Complete user setup.
- **Body**: `{ name: string, email: string, pledgeDays: number, reminderTime: string, timezone: string }`
- **Flow**:
  1.  Validate input.
  2.  Update `User` record.
  3.  Invalidate `user-profile-{userId}` cache.

## 2. POST /api/problems

- **Purpose**: Log a problem and optionally mark day as complete.
- **Flow**:
  1.  Validate input (Zod).
  2.  Calculate `today` using `date-utils.ts`.
  3.  Upsert `DailyLog`.
  4.  Create `ProblemLog`.
  5.  Update Streak (`streak.ts`).
  6.  Award Gems (`gems.ts`).
  7.  **Cache Invalidation**: `revalidateTag('dashboard-{userId}')`.

## 3. GET /api/dashboard

- **Purpose**: Aggregate data for the main view.
- **Flow**:
  1.  Check Cache for `dashboard-{userId}`.
  2.  If miss:
      - Fetch User details.
      - Fetch `DailyLog` for today.
      - Fetch all `DailyLog`s for heatmap.
      - Calculate pledge progress.
      - Store in Cache.
  3.  Return JSON.
