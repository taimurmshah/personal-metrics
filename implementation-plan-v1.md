# Meditation Tracker V1 (MVP) - Implementation Plan v1

Based on the [MVP_PRD.md](./MVP_PRD.md). This plan outlines the steps to build the Minimum Viable Product for the Meditation Tracker iOS application.

## 1. Database Tasks (`Supabase`/`PostgreSQL`)
*   [ ] Define `Users` table schema (or confirm `Supabase` Auth structure suffices) - Ref: FR17
*   [ ] Define `MeditationSessions` table schema - Ref: FR16
*   [ ] Set up `Supabase` project.
*   [ ] Implement `Supabase` Row Level Security (RLS) policies for `MeditationSessions` (users can only access their own data) - Ref: NF3, DB3
*   [ ] Set up `Supabase` Auth for Google Sign-In - Ref: FR1-FR6, DB3

## 2. Backend Tasks (`Node.js`/`TypeScript` on `Vercel`)
*   [ ] Set up `Node.js`/`TypeScript` project (`Express.js`).
*   [ ] Write unit tests for Google Auth verification & user handling (TDD) - Ref: FR4
*   [ ] Implement Google Auth verification & user handling logic (potentially leveraging `Supabase` Auth) - Ref: FR4
*   [ ] Write unit tests for `POST /api/sessions` endpoint (data validation, user auth) (TDD) - Ref: FR13, FR15
*   [ ] Implement `POST /api/sessions` endpoint to receive and store session data in `Supabase` - Ref: FR13, FR14, FR15
*   [ ] Configure `Vercel` project & environment variables.

## 3. Frontend Tasks (iOS `Swift`)
*   [ ] Set up iOS Project (`Swift`, UIKit/SwiftUI).
*   [ ] Write tests for Google Sign-In flow initiation (TDD) - Ref: FR1, FR2
*   [ ] Implement Google Sign-In button and initiate OAuth flow - Ref: FR1, FR2
*   [ ] Write tests for handling Google Sign-In response and sending to backend (TDD) - Ref: FR3
*   [ ] Implement handling of Google Sign-In response and communication with backend auth - Ref: FR3, FR4
*   [ ] Write tests for secure API token storage (e.g., Keychain) (TDD) - Ref: FR5, NF3
*   [ ] Implement secure API token storage - Ref: FR5, NF3
*   [ ] Write tests for Timer UI state transitions (Initial -> Running -> Paused -> Resumed -> Stopped -> Initial) (TDD) - Ref: FR7-FR12
*   [ ] Implement Timer UI (display `00:00:00`, Start/Pause/Resume/Stop buttons) - Ref: FR7, FR8, FR9, FR10, FR11, FR12
*   [ ] Write tests for timer logic (start, pause, resume, stop, time calculation) (TDD) - Ref: FR9, FR10, FR11, FR12
*   [ ] Implement timer logic - Ref: FR9, FR10, FR11, FR12
*   [ ] Write tests for sending session data to backend API on Stop (TDD) - Ref: FR12, FR14
*   [ ] Implement API call to `POST /api/sessions` on Stop - Ref: FR12, FR14
*   [ ] Implement handling of API responses (success/error) and UI reset - Ref: FR12, NF5

## 4. Local Testing Tasks
*   [ ] Test Google Sign-In flow end-to-end (iOS -> Backend -> `Supabase`).
*   [ ] Test session recording flow (Start -> Pause -> Resume -> Stop -> Verify data in `Supabase`).
*   [ ] Test handling of network errors during session save.
*   [ ] Verify RLS policies prevent cross-user data access.
*   [ ] Perform UI testing on target iOS versions/devices.

## 5. Deployment Tasks
*   [ ] Configure CI/CD for backend deployment to `Vercel` - Ref: DEP1, DEP2
*   [ ] Deploy backend API to `Vercel`.
*   [ ] Set up TestFlight for iOS app distribution - Ref: DEP3
*   [ ] Build and distribute iOS app via TestFlight.
*   [ ] Monitor `Vercel` logs and `Supabase` usage.
*   [ ] Prepare for App Store submission (icons, descriptions, etc. - may be post-MVP).

## Implementation Details

*   **Architecture:** Native iOS Frontend (`Swift`), `Node.js`/`TypeScript`/`Express.js` Backend API, `Supabase` (`PostgreSQL`) Database.
*   **Authentication:** Google OAuth handled via `Supabase` Auth is the preferred approach (Ref: DB3) to simplify backend logic. The backend will verify tokens forwarded by the iOS app.
*   **API:** RESTful API hosted on `Vercel`. Key endpoint: `POST /api/sessions`.
*   **Data Storage:** User info potentially managed by `Supabase` Auth. Session data stored in a dedicated `MeditationSessions` table with RLS enabled.

## Relevant Files

*(To be populated as development progresses)*
*   `MVP_PRD.md` - Product Requirements Document
*   `implementation-plan-v1.md` - This file
*   `supabase/migrations/...` - Database schema migrations
*   `supabase/seed.sql` - (Optional) Initial data seeding
*   `backend/src/server.ts` - Main backend application file
*   `backend/src/routes/sessions.ts` - Session API route handler
*   `backend/src/services/auth.ts` - Authentication logic
*   `backend/tests/...` - Backend unit/integration tests
*   `ios/MeditationTracker/AppDelegate.swift` or SceneDelegate - App entry point
*   `ios/MeditationTracker/AuthViewController.swift` - Google Sign-In UI/Logic
*   `ios/MeditationTracker/TimerViewController.swift` - Main timer UI/Logic
*   `ios/MeditationTracker/APIService.swift` - Backend API communication
*   `ios/MeditationTracker/KeychainService.swift` - Secure token storage
*   `ios/MeditationTrackerTests/...` - iOS unit/integration tests 