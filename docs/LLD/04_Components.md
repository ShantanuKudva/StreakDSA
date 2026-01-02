# Component Specifications

## 1. Dashboard Page

- **Components**:
  - `StreakCard`
  - `GemsCard`
  - `PledgeCard`
  - `CheckInButton`
  - `ProblemLogger`
  - `Heatmap` (Custom implementation using shadcn/ui primitives)
- **Data Fetching**: Uses `getDashboardDataCached` (Server Action/Component).

## 2. State Management

### 2.1 Server State

- **Primary**: React Server Components fetch data via Cache.
- **Mutations**: Server Actions for check-in, problem logging.
- **Revalidation**: `revalidateTag()` after mutations.

### 2.2 Client State

- **Local**: `useState` for optimistic UI.
- **Forms**: React Hook Form + Zod.
- **Toasts**: Sonner for notifications.

## 3. Error Handling

### 3.1 Error Hierarchy

```typescript
export class AppError extends Error { ... }
export class AlreadyCheckedInError extends AppError { ... }
export class DeadlinePassedError extends AppError { ... }
export class ProblemLimitError extends AppError { ... }
```

## 4. Testing Strategy

- **Unit Tests**: Jest for utilities (`date-utils`, `streak`).
- **Integration Tests**: API route testing.
- **E2E**: Playwright (future).
