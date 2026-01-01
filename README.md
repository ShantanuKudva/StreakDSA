# StreakDSA 🚀

A gamified, design-forward accountability system for daily DSA practice. Built to help you build consistency with streaks, gems, and detailed analytics.

## ✨ Features

- **🔥 Advanced Streak System**:

  - Tracks consecutive days of problem solving.
  - **Freeze Logic**: Miss a day? Use a "Freeze" (implementation pending) or lose the streak.
  - **Smart Deletion**: Deleting your only problem for the day properly resets/adjusts the streak.

- **💎 Gamification**:

  - Earn **Gems** for every problem logged.
  - Visual feedback and animations.

- **📊 Interactive Analytics**:

  - **GitHub-style Heatmap**: Visualize your yearly activity grid.
  - **Profile Stats**: Line charts for consistency, Pie charts for difficulty breakdown, and Tag usage stats.
  - **Glassmorphic UI**: Beautiful, modern "Card Spotlight" design using Tailwind and Framer Motion concepts.

- **📝 Comprehensive Logging**:
  - **Daily Log**: Track problems by Topic, Difficulty, and custom Tags.
  - **Coding Journey**: Dedicated `/logs` page with a calendar view to browse history.
  - **Rich Details**: Add notes and external links to every problem.
  - **Timezone Aware**: Server-side logic ensures your "today" matches your local time.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Auth**: NextAuth.js (Google Provider)
- **Styling**: Tailwind CSS + shadcn/ui + Lucide Icons
- **State/Validation**: Zod, Sonner (Toasts)

## 🚀 Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database and Google Auth credentials
   ```

3. **Set up database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

   > **Note**: If you encounter `ENOENT` errors or "No Gems" issues, ensure you aren't running multiple instances of the dev server.

5. Open [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure

- `src/app`: App Router pages and API routes.
- `src/components`: Reusable UI components (Dashboard, Profile, UI Kit).
- `src/lib`: Utilities, database client, and business logic (Timezones, Streaks).
- `prisma`: Database schema and migrations.
- `docs`: Detailed documentation (PRD, HLD, LLD).

## 📄 Documentation

See the `docs/` folder for architectural details:

- [PRD.md](docs/PRD.md) - Product Requirements
- [HLD.md](docs/HLD.md) - High-Level Design
- [LLD.md](docs/LLD.md) - Low-Level Design
- [API-SPEC.md](docs/API-SPEC.md) - API Specification
