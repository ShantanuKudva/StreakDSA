# StreakDSA Feature Documentation

## Overview

This document provides a comprehensive breakdown of every feature in the StreakDSA application, detailing its current implementation status, technical architecture, and any identified issues or redundancies.

## 1. Authentication & User Management

### 1.1 User Signup/Login

- **Description**: Users can sign up or log in using Google OAuth.
- **Status**: ✅ Implemented
- **Implementation**:
  - **Provider**: NextAuth.js with Google Provider.
  - **Database**: `User`, `Account`, `Session` tables (Prisma adapter).
  - **Flow**: User clicks "Sign in with Google" -> Redirect to Google -> Callback to `/api/auth/callback/google` -> Session created.

### 1.2 User Onboarding

- **Description**: Comprehensive setup flow for new users.
- **Status**: ✅ Implemented (Partial - needs refinement)
- **Implementation**:
  - **API**: `POST /api/user/onboard`.
  - **Flow**:
    1.  **Profile Setup**: User sets Name and Email (if not provided by OAuth).
    2.  **Pledge Setup**: User selects pledge duration (e.g., 30, 60, 90 days).
    3.  **Reminder Setup**: User sets daily reminder time.
  - **Data**: Updates `User` model.

### 1.3 Profile Management

- **Description**: Users can view their profile details.
- **Status**: ✅ Implemented
- **Implementation**:
  - **UI**: Header displays avatar/initials. Profile page (`/profile`).
  - **Data**: Fetches from `User` table.

## 2. Core Loop: Daily Check-in

### 2.1 Mark Day Complete

- **Description**: Users click a button to mark the current day as complete.
- **Status**: ✅ Implemented
- **Implementation**:
  - **API**: `POST /api/checkin` (implied) or handled within `POST /api/problems`.
  - **Logic**:
    - Determines "Today" based on user timezone.
    - Creates/Updates `DailyLog`.
    - Updates `User.currentStreak`, `User.daysCompleted`.
    - Awards Gems (+10).

### 2.2 Streak Calculation

- **Description**: Tracks consecutive days of activity.
- **Status**: ⚠️ Implemented with Redundancy (Fix in progress)
- **Implementation**:
  - **Logic**: `updateStreakOnProblemLog` in `src/lib/streak.ts`.
  - **Fix**: Consolidating to `date-utils.ts` to remove redundant `dsa-utils.ts`.

### 2.3 Gems System

- **Description**: Users earn gems for activity.
- **Status**: ✅ Implemented
- **Implementation**:
  - **Logic**: +10 gems per problem/check-in.
  - **Data**: `User.gems` integer field.
  - **UI**: Displayed in Header.

## 3. Problem Logging

### 3.1 Log a Problem

- **Description**: Users can log specific DSA problems solved.
- **Status**: ✅ Implemented
- **Implementation**:
  - **API**: `POST /api/problems`.
  - **Fields**: Topic (Enum), Name, Difficulty, External URL, Notes.
  - **Constraints**: Max 2 problems per day (enforced in API).

### 3.2 View Daily Logs

- **Description**: Users can see problems logged for "Today".
- **Status**: ✅ Implemented
- **Implementation**:
  - **API**: `GET /api/problems` (returns today's problems).
  - **UI**: `ProblemList` component on Dashboard.

### 3.3 Edit/Delete Problems

- **Description**: Users can modify or remove logs.
- **Status**: ✅ Implemented
- **Implementation**:
  - **API**: `PATCH /api/problems`, `DELETE /api/problems`.
  - **Logic**: Deleting a problem might affect streak if it was the only activity for the day.

## 4. Visualization & Analytics

### 4.1 Heatmap

- **Description**: GitHub-style contribution graph.
- **Status**: ✅ Implemented
- **Implementation**:
  - **API**: `GET /api/dashboard` returns `heatmapDays`.
  - **UI**: `Heatmap` component (using shadcn/ui primitives).

### 4.2 Pledge Progress

- **Description**: Progress bar showing days completed vs pledge goal.
- **Status**: ✅ Implemented
- **Implementation**:
  - **Data**: `User.daysCompleted` / `User.pledgeDays`.
  - **UI**: `CardSpotlight` with progress bar.

### 4.3 Streak Stats

- **Description**: Display current and max streak.
- **Status**: ✅ Implemented
- **Implementation**:
  - **Data**: `User.currentStreak`, `User.maxStreak`.
  - **UI**: Hero section on Dashboard.

## 5. Notifications

### 5.1 Email Reminders

- **Description**: Transactional email reminders sent at user's configured time.
- **Status**: ❌ Missing (Priority Implementation)
- **Implementation**:
  - **Service**: Resend (recommended).
  - **Trigger**: Vercel Cron job calling `/api/cron/reminder`.
  - **Content**: "Streak at risk" message.

## 6. Technical Architecture

### 6.1 Caching Layer

- **Description**: Implementation of caching to optimize database load and improve response times.
- **Status**: ❌ Missing (Priority Implementation)
- **Plan**:
  - **Data Cache**: Use Next.js `unstable_cache` for expensive queries.
  - **Tagging**: Implement `revalidateTag` for cache invalidation on mutations.

### 6.2 Date Handling

- **Issue**: Multiple sources of truth for "Today".
- **Fix**: Delete `dsa-utils.ts`, use `date-utils.ts` exclusively.

### 6.3 API Structure

- **Issue**: Inline validation logic and constant definitions.
- **Fix**: Move Zod schemas to `src/lib/validators.ts` and constants to `src/lib/constants.ts`.
