# Data Flow

## 1. Check-In Flow

```
User          Client          API          StreakService      Database      DataCache
 |               |             |                 |               |              |
 | Click "Mark"  |             |                 |               |              |
 |-------------->|             |                 |               |              |
 |               | POST /api   |                 |               |              |
 |               |------------>|                 |               |              |
 |               |             | Validate        |               |              |
 |               |             |---------------->|               |              |
 |               |             | markDayComplete |               |              |
 |               |             |---------------->|               |              |
 |               |             |                 | Create/Update |              |
 |               |             |                 |-------------->|              |
 |               |             |                 | Calc Streak   |              |
 |               |             |                 |-------------->|              |
 |               |             |                 | Award Gems    |              |
 |               |             |                 |-------------->|              |
 |               |             |                 | Update User   |              |
 |               |             |                 |-------------->|              |
 |               |             | Return Result   |               |              |
 |               |             |<----------------|               |              |
 |               |             |                 |               |              |
 |               |             | revalidateTag   |               |              |
 |               |             |----------------------------------------------->|
 |               | 200 OK      |                 |               |              |
 |               |<------------|                 |               |              |
 | Update UI     |             |                 |               |              |
 |-------------->|             |                 |               |              |
 | Show Success  |             |                 |               |              |
 |<--------------|             |                 |               |              |
```

## 2. Notification Flow

```
Vercel Cron        API        NotificationService      Database        Resend
    |               |                 |                   |               |
    | POST /reminder|                 |                   |               |
    |-------------->|                 |                   |               |
    |               | Get due users   |                   |               |
    |               |------------------------------------>|               |
    |               |                 |                   |               |
    |               | loop users      |                   |               |
    |               |---------------->|                   |               |
    |               |                 | Send Email        |               |
    |               |                 |---------------------------------->|
    |               |                 |                   |               |
    | 200 OK        |                 |                   |               |
    |<--------------|                 |                   |               |
```
