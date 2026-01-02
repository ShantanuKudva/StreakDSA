# System Architecture

## 1. Architecture Overview

```
+------+       +------------+       +------------------+
| User | ----> | CDN / Edge | ----> |  Next.js Server  |
+------+       +------------+       +------------------+
                                             |
                                             v
                                  +-----------------------+
                                  |   Application Layer   |
                                  |                       |
                                  |  [NextAuth]           |
                                  |  [API Layer]          |
                                  |  [React Server Comps] |
                                  +-----------------------+
                                             |
                                             v
                  +--------------------------+-------------------------+
                  |                          |                         |
        +-------------------+      +-------------------+      +------------------+
        |    Data Layer     |      |     Services      |      | External Services|
        |                   |      |                   |      |                  |
        | [PostgreSQL]      |      | [Streak Logic]    |      | [Google Identity]|
        | [Data Cache]      |      | [Gems Logic]      |      | [Resend API]     |
        |                   |      | [Notif Service]   |      |                  |
        +-------------------+      +-------------------+      +------------------+
```

## 2. Core Components

1.  **Frontend**: Next.js 15 App Router, Tailwind CSS, shadcn/ui.
2.  **Backend**: Next.js API Routes (`/api/problems`, `/api/dashboard`).
3.  **Database**: PostgreSQL via Prisma ORM.
4.  **Auth**: NextAuth.js (Google Provider).
5.  **Caching**: Next.js Data Cache (`unstable_cache`) for optimized reads.
6.  **Charting**: `recharts` (via `shadcn/ui` charts) for analytics. Custom implementation for Heatmap using `shadcn/ui` primitives.

## 3. Tech Stack Cleanup (Redundancies)

The following libraries are identified as redundant and will be removed:

- `@nivo/calendar`: Unused (Heatmap is custom).
- `react-activity-calendar`: Unused.
- `react-activity-heatmap`: Unused.
- `dsa-utils.ts`: Redundant date logic (consolidating to `date-utils.ts`).

## 4. Component Architecture

### 4.1 Application Structure

```

streak-dsa/
├── app/ # Next.js App Router
│ ├── (auth)/ # Auth routes group
│ │ ├── login/
│ │ └── onboard/
│ ├── (dashboard)/ # Protected routes
│ │ ├── page.tsx # Dashboard
│ │ ├── matrix/ # Heatmap view
│ │ └── settings/
│ ├── api/ # API routes
│ │ ├── auth/[...nextauth]/
│ │ ├── checkin/
│ │ ├── problems/
│ │ ├── dashboard/
│ │ ├── user/
│ │ └── cron/
│ ├── layout.tsx
│ └── globals.css
├── components/ # React components
│ ├── ui/ # shadcn/ui components
│ ├── dashboard/
│ ├── heatmap/
│ └── forms/
├── lib/ # Utilities
│ ├── db.ts # Prisma client
│ ├── auth.ts # NextAuth config
│ ├── streak.ts # Streak logic
│ ├── gems.ts # Gems logic
│ ├── notifications.ts # Email service
│ ├── date-utils.ts # Timezone & date helpers
│ ├── cache.ts # Caching layer
│ └── validators.ts # Zod schemas
├── prisma/
│ └── schema.prisma
├── public/
└── types/ # TypeScript types

```
