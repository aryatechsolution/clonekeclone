# Demo / Production Mode Analysis

## Current State

API Based
- Dashboard
- Payments

Firebase Based
- AuthContext
- Profile
- Residents
- Notifications
- NotificationList
- Subscription
- Chatbot
- AddResidentModal
- ReferralModal
- notificationService

Mock Data
- Index
- Dashboard fallback

## Proposed Architecture

ModeManager
    ↓
Demo Provider / Production Provider
    ↓
Auth + Data Layer
    ↓
Pages

## Main Integration Points

- src/context/AuthContext.tsx
- src/integrations/firebase/client.ts
- src/services/api.ts

Goal:
Allow switching between Demo and Production without changing page-level logic.

## Implementation Plan

Phase 1
- Add APP_MODE configuration
- Add ModeManager

Phase 2
- Create DemoAuthProvider
- Create ProductionAuthProvider

Phase 3
- Create DemoDataProvider
- Create ProductionDataProvider

Phase 4
- Integrate with AuthContext
- Integrate with api.ts
- Integrate with firebase/client.ts

Phase 5
- Add UI toggle for Demo / Production mode
- Persist selection in local storage

Expected Result
- Demo mode uses mock data
- Production mode uses Firebase and Backend APIs
- No page-level changes required
