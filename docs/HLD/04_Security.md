# Security Design

## 1. Authentication

- **Method:** NextAuth.js with JWT strategy
- **Providers:** Google OAuth
- **Session:** HTTP-only secure cookies
- **Token Refresh:** Automatic via NextAuth

## 2. Authorization

| Resource       | Rule                        |
| -------------- | --------------------------- |
| Dashboard      | Authenticated users only    |
| Check-in       | Own user only               |
| Problems       | Own user only               |
| Cron endpoints | CRON_SECRET header required |

## 3. Scalability & Monitoring

### 3.1 Caching Strategy

To improve performance and reduce database load, we implement a caching layer using Next.js `unstable_cache`.

- **Dashboard Data**: Cache aggregated dashboard data (User stats, Heatmap).
  - **Tag**: `dashboard-{userId}`
  - **Revalidation**: Invalidate this tag whenever a `DailyLog` or `ProblemLog` is created/updated.
- **User Profile**: Cache basic user info.
  - **Tag**: `user-profile-{userId}`
  - **Revalidation**: Invalidate on profile update.

### 3.2 MVP Monitoring

| Aspect      | Tool                  |
| ----------- | --------------------- |
| Errors      | Vercel Error Tracking |
| Logs        | Vercel Logs           |
| Performance | Vercel Analytics      |
| Uptime      | Vercel Status         |
