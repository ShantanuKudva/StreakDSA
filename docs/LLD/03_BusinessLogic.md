# Business Logic Specifications

## 1. Module Breakdown

```
lib/
├── db.ts              # Prisma client singleton
├── auth.ts            # NextAuth configuration
├── streak.ts          # Streak calculation logic
├── gems.ts            # Gems awarding logic
├── notifications.ts   # Email service (Resend)
├── date-utils.ts      # Timezone & date helpers (Consolidated)
├── cache.ts           # Caching layer (unstable_cache)
└── validators.ts      # Zod schemas for validation
```

## 2. Date Utilities (Standardized)

**`src/lib/date-utils.ts`**

- **`getTodayForUser(timezone)`**: Returns a `Date` object set to 00:00:00 UTC, representing the start of the user's current day. This ensures database queries for `date` match exactly.
- **`isDeadlinePassed(timezone, reminderTime)`**: Compares current user-local time against their reminder setting.

## 3. Caching Strategy

**`src/lib/cache.ts`**

- **Dashboard Data**: Cache aggregated dashboard data (User stats, Heatmap).
  - **Tag**: `dashboard-{userId}`
  - **Revalidation**: Invalidate this tag whenever a `DailyLog` or `ProblemLog` is created/updated.
- **User Profile**: Cache basic user info.
  - **Tag**: `user-profile-{userId}`
  - **Revalidation**: Invalidate on profile update.

## 4. Notifications

**`src/lib/notifications.ts`**

- **Service**: Resend
- **Trigger**: Vercel Cron job calling `/api/cron/reminder`.
- **Content**: "Streak at risk" message.
