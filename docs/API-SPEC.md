# StreakDSA API Specification

**Version:** 1.0  
**Base URL:** `/api`  
**Last Updated:** 2026-01-01

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [User Endpoints](#2-user-endpoints)
3. [Check-In Endpoints](#3-check-in-endpoints)
4. [Problem Endpoints](#4-problem-endpoints)
5. [Dashboard Endpoints](#5-dashboard-endpoints)
6. [Cron Endpoints](#6-cron-endpoints)
7. [Error Handling](#7-error-handling)
8. [Data Types](#8-data-types)

---

## 1. Authentication

### 1.1 Overview

Authentication uses NextAuth.js with two providers:

- **Magic Link** (email-based passwordless)
- **Google OAuth 2.0**

All authenticated endpoints require a valid session cookie.

### 1.2 Auth Endpoints

| Endpoint                       | Method | Description         |
| ------------------------------ | ------ | ------------------- |
| `/api/auth/signin`             | GET    | Render sign-in page |
| `/api/auth/signin/:provider`   | POST   | Initiate sign-in    |
| `/api/auth/signout`            | POST   | Sign out user       |
| `/api/auth/session`            | GET    | Get current session |
| `/api/auth/callback/:provider` | GET    | OAuth callback      |

---

## 2. User Endpoints

### 2.1 Onboard User

Sets up a new user's pledge after authentication.

```http
POST /api/user/onboard
Content-Type: application/json
```

**Request Body:**

```json
{
  "pledgeDays": 90,
  "reminderTime": "22:00",
  "timezone": "Asia/Kolkata",
  "phone": "+919876543210"
}
```

| Field          | Type    | Required | Description                        |
| -------------- | ------- | -------- | ---------------------------------- |
| `pledgeDays`   | integer | ✅       | Pledge duration (30, 60, 90, etc.) |
| `reminderTime` | string  | ✅       | Daily reminder time (HH:mm)        |
| `timezone`     | string  | ✅       | User timezone (IANA format)        |
| `phone`        | string  | ❌       | WhatsApp number with country code  |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "pledgeDays": 90,
    "startDate": "2026-01-01",
    "reminderTime": "22:00",
    "timezone": "Asia/Kolkata",
    "currentStreak": 0,
    "maxStreak": 0,
    "gems": 0
  }
}
```

---

### 2.2 Get User Profile

```http
GET /api/user/profile
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+919876543210",
    "pledgeDays": 90,
    "startDate": "2026-01-01",
    "reminderTime": "22:00",
    "timezone": "Asia/Kolkata",
    "currentStreak": 16,
    "maxStreak": 16,
    "daysCompleted": 16,
    "gems": 210
  }
}
```

---

### 2.3 Update User Settings

```http
PATCH /api/user/settings
Content-Type: application/json
```

**Request Body:**

```json
{
  "reminderTime": "21:00",
  "phone": "+919876543210",
  "dailyProblemLimit": 5
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Settings updated"
}
```

---

## 3. Check-In Endpoints

### 3.1 Mark Today Complete

Primary check-in action.

```http
POST /api/checkin
```

**Request Body:** None required

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "date": "2026-01-01",
    "completed": true,
    "markedAt": "2026-01-01T18:30:00Z",
    "streak": {
      "current": 17,
      "max": 17,
      "gemsAwarded": 10,
      "milestoneReached": null
    }
  }
}
```

**Response (409 Conflict - Already checked in):**

```json
{
  "success": false,
  "error": {
    "code": "ALREADY_CHECKED_IN",
    "message": "Today has already been marked complete"
  }
}
```

**Response (403 Forbidden - Deadline passed):**

```json
{
  "success": false,
  "error": {
    "code": "DEADLINE_PASSED",
    "message": "Check-in deadline for today has passed"
  }
}
```

---

### 3.2 Get Today's Status

```http
GET /api/checkin/today
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "date": "2026-01-01",
    "completed": false,
    "deadlineAt": "2026-01-01T22:00:00+05:30",
    "timeRemaining": "3h 30m"
  }
}
```

---

## 4. Problem Endpoints

### 4.1 Log a Problem

```http
POST /api/problems
Content-Type: application/json
```

**Request Body:**

```json
{
  "topic": "DYNAMIC_PROGRAMMING",
  "name": "Longest Common Subsequence",
  "difficulty": "MEDIUM",
  "externalUrl": "https://leetcode.com/problems/longest-common-subsequence/"
}
```

| Field         | Type              | Required | Description                  |
| ------------- | ----------------- | -------- | ---------------------------- |
| `topic`       | Topic (enum)      | ✅       | Problem topic category       |
| `name`        | string            | ✅       | Problem name (max 255 chars) |
| `difficulty`  | Difficulty (enum) | ✅       | EASY, MEDIUM, or HARD        |
| `externalUrl` | string            | ❌       | LeetCode/external link       |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "topic": "DYNAMIC_PROGRAMMING",
    "name": "Longest Common Subsequence",
    "difficulty": "MEDIUM",
    "createdAt": "2026-01-01T18:30:00Z"
  }
}
```

**Response (400 Bad Request - Limit exceeded):**

```json
{
  "success": false,
  "error": {
    "code": "PROBLEM_LIMIT_EXCEEDED",
    "message": "Maximum 2 problems per day allowed"
  }
}
```

---

### 4.2 Get Today's Problems

```http
GET /api/problems/today
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "problems": [
      {
        "id": "uuid",
        "topic": "DYNAMIC_PROGRAMMING",
        "name": "Longest Common Subsequence",
        "difficulty": "MEDIUM",
        "tags": ["DP", "LCS"],
        "notes": "Classic DP problem",
        "externalUrl": "https://leetcode.com/...",
        "createdAt": "2026-01-01T18:30:00Z"
      }
    ],
    "remaining": 1
  }
}
```

---

### 4.3 Delete a Problem

```http
DELETE /api/problems/:id
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Problem deleted"
}
```

---

## 5. Dashboard Endpoints

### 5.1 Get Dashboard Data

Primary dashboard aggregation endpoint.

```http
GET /api/dashboard
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "name": "John Doe",
      "email": "user@example.com"
    },
    "pledge": {
      "totalDays": 90,
      "daysCompleted": 16,
      "daysRemaining": 74,
      "startDate": "2025-12-16",
      "endDate": "2026-03-15"
    },
    "streak": {
      "current": 16,
      "max": 16
    },
    "gems": 210,
    "today": {
      "completed": false,
      "deadlineAt": "2026-01-01T22:00:00+05:30",
      "problemsLogged": 0
    }
  }
}
```

---

### 5.2 Get Heatmap/Matrix Data

```http
GET /api/matrix?startDate=2025-12-01&endDate=2026-01-01
```

**Query Parameters:**

| Param       | Type | Required | Description                                 |
| ----------- | ---- | -------- | ------------------------------------------- |
| `startDate` | date | ❌       | Start of date range (default: pledge start) |
| `endDate`   | date | ❌       | End of date range (default: today)          |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "days": [
      {
        "date": "2025-12-16",
        "completed": true,
        "isMilestone": false,
        "problems": [{ "topic": "ARRAYS", "difficulty": "EASY" }]
      },
      {
        "date": "2025-12-17",
        "completed": true,
        "isMilestone": true,
        "milestoneType": "7_DAY_STREAK",
        "problems": []
      },
      {
        "date": "2025-12-18",
        "completed": false,
        "isMilestone": false,
        "problems": []
      }
    ],
    "topics": {
      "ARRAYS": 5,
      "DYNAMIC_PROGRAMMING": 3,
      "GRAPHS": 2
    }
  }
}
```

---

## 6. Cron Endpoints

> [!CAUTION]
> Cron endpoints are protected by a secret key. Include `Authorization: Bearer <CRON_SECRET>` header.

### 6.1 Send Daily Reminders

Triggered by scheduler at each user's reminder time.

```http
POST /api/cron/reminder
Authorization: Bearer <CRON_SECRET>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "remindersSent": 42,
    "errors": 0
  }
}
```

---

### 6.2 Process Missed Days

Triggered daily after midnight to mark missed days and reset streaks.

```http
POST /api/cron/process-day
Authorization: Bearer <CRON_SECRET>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "processed": 150,
    "missedDays": 12,
    "streaksReset": 12,
    "alertsSent": 12
  }
}
```

---

## 7. Error Handling

### 7.1 Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### 7.2 Error Codes

| Code                     | HTTP Status | Description               |
| ------------------------ | ----------- | ------------------------- |
| `UNAUTHORIZED`           | 401         | Not authenticated         |
| `FORBIDDEN`              | 403         | Not authorized for action |
| `NOT_FOUND`              | 404         | Resource not found        |
| `VALIDATION_ERROR`       | 400         | Invalid request body      |
| `ALREADY_CHECKED_IN`     | 409         | Day already marked        |
| `DEADLINE_PASSED`        | 403         | Check-in too late         |
| `PROBLEM_LIMIT_EXCEEDED` | 400         | Max 2 problems/day        |
| `USER_NOT_ONBOARDED`     | 403         | Pledge not set up         |
| `INTERNAL_ERROR`         | 500         | Server error              |

---

## 8. Data Types

### 8.1 Enums

**Topic:**

```typescript
type Topic =
  | "BASICS"
  | "SORTING"
  | "ARRAYS"
  | "BINARY_SEARCH"
  | "STRINGS"
  | "LINKED_LISTS"
  | "RECURSION"
  | "BIT_MANIPULATION"
  | "STACKS_QUEUES"
  | "SLIDING_WINDOW"
  | "HEAPS"
  | "GREEDY"
  | "BINARY_TREES"
  | "BST"
  | "GRAPHS"
  | "DYNAMIC_PROGRAMMING"
  | "TRIES"
  | "OTHER";
```

**Difficulty:**

```typescript
type Difficulty = "EASY" | "MEDIUM" | "HARD";
```

### 8.2 Common Objects

**User:**

```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  pledgeDays: number;
  startDate: string; // ISO date
  reminderTime: string; // HH:mm
  timezone: string;
  currentStreak: number;
  maxStreak: number;
  daysCompleted: number;
  gems: number;
}
```

**DailyLog:**

```typescript
interface DailyLog {
  id: string;
  date: string; // ISO date
  completed: boolean;
  markedAt?: string; // ISO datetime
  problems: ProblemLog[];
}
```

**ProblemLog:**

```typescript
interface ProblemLog {
  id: string;
  topic: Topic;
  name: string;
  difficulty: Difficulty;
  externalUrl?: string;
  createdAt: string; // ISO datetime
}
```

---

## Document History

| Version | Date       | Author | Changes                   |
| ------- | ---------- | ------ | ------------------------- |
| 1.0     | 2026-01-01 | —      | Initial API specification |

---

**End of Document**
