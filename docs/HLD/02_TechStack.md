# Technology Stack

## 1. Core Technologies

| Layer          | Technology   | Version | Rationale                   |
| -------------- | ------------ | ------- | --------------------------- |
| **Runtime**    | Node.js      | 20 LTS  | Stability, performance      |
| **Framework**  | Next.js      | 15.x    | App Router, RSC, API routes |
| **Language**   | TypeScript   | 5.x     | Type safety, DX             |
| **Database**   | PostgreSQL   | 16      | ACID, reliability           |
| **ORM**        | Prisma       | 6.x     | Type-safe, migrations       |
| **Styling**    | Tailwind CSS | 3.x     | Utility-first, fast         |
| **Components** | shadcn/ui    | Latest  | Accessible, customizable    |
| **Charts**     | Recharts     | Latest  | Via shadcn/ui charts        |

## 2. External Services

| Service      | Provider    | Purpose               |
| ------------ | ----------- | --------------------- |
| **Hosting**  | Vercel      | Serverless deployment |
| **Database** | Neon        | Serverless PostgreSQL |
| **Auth**     | NextAuth.js | OAuth + Magic Link    |
| **Email**    | Resend      | Transactional email   |
| **Cron**     | Vercel Cron | Scheduled jobs        |
