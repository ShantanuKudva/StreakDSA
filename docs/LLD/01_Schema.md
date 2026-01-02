# Database Schema Details

## 1. Key Models (Prisma)

### User

- `id`: UUID
- `email`: String (Unique)
- `name`: String (Nullable)
- `timezone`: String (Default "UTC")
- `pledgeDays`: Int
- `currentStreak`: Int
- `gems`: Int

### DailyLog

- `userId`: UUID
- `date`: DateTime (Stored as UTC Midnight of user's local day)
- `completed`: Boolean
- **Constraint**: Unique `[userId, date]`

### ProblemLog

- `dailyLogId`: UUID
- `topic`: Enum
- `name`: String
- `difficulty`: Enum
