# Low-Level Design (LLD) - v2: Implementation Details

## 1. API Specifications

### 1.1 Friend Management

**`POST /api/friends/request`**

- **Auth**: Required.
- **Body**: `{ email: string }`
- **Logic**:
  1. Find target user by email.
  2. Check if request already exists (forward or reverse).
  3. Create `Friendship` with status `PENDING`.
  4. Create `Notification` for target user.

**`GET /api/friends/nudge`**

- **Auth**: Required.
- **Body**: `{ friendId: string }`
- **Logic**:
  1. Verify friendship exists and is `ACCEPTED`.
  2. Rate Limit: Check Redis/DB for `nudge:senderId:receiverId:timestamp`. Reject if < 24h.
  3. Send Push Notification via FCM.
  4. Log event.

### 1.2 Feed Generation

**`GET /api/social/feed`**

- **Query**: `page=1&limit=20`
- **Logic**:
  1. Get `friendIds` = `db.friendship.findMany({ where: { OR: [{requesterId: me}, {receiverId: me}], status: ACCEPTED } })`.
  2. `db.dailyLog.findMany({ where: { userId: { in: friendIds } }, orderBy: { date: desc }, include: { problems: true } })`.
  3. Transform to Feed Item DTO.

## 2. Component Implementation

### 2.1 FriendsList Component (`src/components/social/friends-list.tsx`)

- **State**: `friends[]`, `requests[]`, `loading`.
- **Render**:
  - Validates `pledgeDays > 0` (handled by page wrapper).
  - Maps `friends` to cards.
  - "Nudge" button disabled if `alreadyNudged` (optimistic UI update).

### 2.2 Badge Handling

- **Trigger**: In `api/problems/route.ts` (POST), after updating streak:
  - Call `GamificationService.evaluate(userId)`.
  - Iterate all `badges` where `category != MANUAL`.
  - If `condition` met (e.g. `streak >= 7`) AND user doesn't have it:
    - `db.userBadge.create(...)`.
    - `db.notification.create({ type: BADGE_EARNED ... })`.

## 3. Database Migrations

1. `npx prisma migrate dev --name add_social_layer`
   - Creates `Friendship`, `Notification`, `Badge`, `UserBadge`, `Challenge`, `UserChallenge` tables.
2. `npx tsx prisma/seed-badges.ts`
   - Populates initial Badge definitions.
