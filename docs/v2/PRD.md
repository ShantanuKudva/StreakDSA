# Product Requirements Document (PRD) - v2: Social & Gamification

## 1. Introduction

**Project Name:** StreakDSA v2 - Social Layer
**Goal:** Increase user retention and engagement by adding social connectivity (Friends, Feed) and advanced gamification (Badges, Competitions).
**Core Value:** accountability is stronger when shared.

## 2. User Stories

### Social Connections

- As a user, I want to search for friends by email or username so I can connect with them.
- As a user, I want to send and accept friend requests to build my network.
- As a user, I want to see a list of my friends and their current streak status.

### Activity Feed

- As a user, I want to see a feed of my friends' activities (problem solved, milestones hit) so I can stay motivated.
- As a user, I want to be notified when a friend achieves something significant.

### Gamification (Strava-style)

- As a user, I want to earn "Badges" for specific achievements (e.g., "7 Day Streak", "10 Hard Problems").
- As a user, I want to view a "Trophy Case" on my profile to show off my badges.
- As a user, I want to join time-bound "Challenges" (e.g., "January LeetCode Challenge") and compete for completion.

### Nudges (Duolingo-style)

- As a user, I want to "Nudge" friends who haven't done their daily problem yet.
- As a user, I want to receive a push notification when a friend nudges me, reminding me to keep my streak.

## 3. detailed Features

### 3.1 Friends System

- **Friend Requests**: Two-way confirmation system (Request -> Accept).
- **Privacy**: Users can set their profile to Public or Friends-Only.

### 3.2 Leaderboards

- **Weekly/Monthly**: separate leaderboards for Gems earned and Streak length.
- **Scope**: "Friends" leaderboard (primary) and "Global" leaderboard (optional/secondary).

### 3.3 Challenges

- **Types**: Problem Count, Streak Maintenance, Topic Mastery.
- **Duration**: Weekly or Monthly.
- **Reward**: Exclusive Badge upon completion.

### 3.4 Notifications

- **Types**: Friend Request, Request Accepted, Badge Earned, Challenge Joined, Challenge Completed, Streak Nudge.
- **Channel**: In-app feed and Push Notifications (FCM/WebPush).
