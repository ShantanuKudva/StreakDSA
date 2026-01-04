# High-Level Design (HLD) - v2: Social Architecture

## 1. System Context

The v2 update introduces a "Social Graph" to the existing User-centric architecture.

- **Users** can now have N:N relationships with other Users (Friendships).
- **Events** (problem logs) now fan-out to Friends' feeds.
- **Engagement** is driven by a Badging/Challenge engine.

## 2. Data Model (Schema)

### 2.1 Social Graph

```prisma
model Friendship {
  id          String   @id @default(uuid())
  requesterId String
  receiverId  String
  status      FriendshipStatus @default(PENDING) // PENDING, ACCEPTED, REJECTED, BLOCKED
  createdAt   DateTime @default(now())

  requester   User     @relation("SentRequests", fields: [requesterId], references: [id])
  receiver    User     @relation("ReceivedRequests", fields: [receiverId], references: [id])

  @@unique([requesterId, receiverId])
}
```

### 2.2 Notification System

```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      NotificationType // FRIEND_REQUEST, STREAK_NUDGE, BADGE_EARNED, etc.
  message   String
  read      Boolean  @default(false)
  data      Json?
}
```

### 2.3 Gamification Engine

```prisma
model Badge {
  id          String   @id @default(uuid())
  slug        String   @unique
  name        String
  category    BadgeCategory // MILESTONE, CHALLENGE, SKILL
  condition   Json     // e.g. { "type": "streak", "count": 7 }
}

model UserBadge {
  userId      String
  badgeId     String
  earnedAt    DateTime
}

model Challenge {
  id          String   @id @default(uuid())
  type        ChallengeType
  startDate   DateTime
  endDate     DateTime
  badgeId     String?
}
```

## 3. Component Architecture

### 3.1 Social Service

- Handles Friend Request logic (send, accept, block).
- Enforces privacy controls.
- "Feed Aggregator": Efficiently queries `DailyLog` entries for a list of `friendIds`.

### 3.2 Gamification Engine

- **Trigger-based**: Listens to `ProblemLog.create` events.
- **Evaluator**: Checks `Badge.condition` against User stats.
- **Awarder**: Creates `UserBadge` and `Notification` if condition met.

### 3.3 Nudge Service

- Rate Limiter: Ensures 1 nudge/friend/day (Redis or DB timestamp check).
- Dispatcher: Sends Push Notification via FCM/WebPush.
