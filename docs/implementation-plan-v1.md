# Meditation Tracker V1 (MVP) - Implementation Plan v1

Based on the [prd_v1.md](./prd_v1.md). This plan outlines the steps to build the Minimum Viable Product for the Meditation Tracker iOS application.

## 1. Database Tasks (`Supabase`/`PostgreSQL`)
*   [x] Define `Users` table schema (or confirm `Supabase` Auth structure suffices) - Ref: FR17
*   [x] Define `MeditationSessions` table schema - Ref: FR16
*   [x] Set up `Supabase` project.
*   [x] Implement `Supabase` Row Level Security (RLS) policies for `MeditationSessions` (users can only access their own data) - Ref: NF3, DB3
*   [x] Set up `Supabase` Auth for Google Sign-In - Ref: FR1-FR6, DB3

## 2. Backend Tasks (`Node.js`/`TypeScript` on `Vercel`)
*   [x] Set up `Node.js`/`TypeScript` project (`Express.js`).
*   [x] Write unit tests for Google Auth verification & user handling (TDD) - Ref: FR4
*   [x] Implement Google Auth verification & user handling logic (potentially leveraging `Supabase` Auth) - Ref: FR4
*   [x] Write unit tests for `POST /api/sessions` endpoint (data validation, user auth) (TDD) - Ref: FR13, FR15
*   [x] Implement `POST /api/sessions` endpoint to receive and store session data in `Supabase` - Ref: FR13, FR14, FR15
*   [x] Configure `Vercel` project & environment variables.

## 3. Frontend Tasks (React Native for iOS)
*   [x] Set up React Native Project (targeting iOS initially).
*   [x] Write tests for Google Sign-In flow initiation (TDD, using React Native testing library and a Google Sign-In mock) - Ref: FR1, FR2
*   [x] Implement Google Sign-In button and initiate OAuth flow (using a React Native Google Sign-In library) - Ref: FR1, FR2
*   [x] Write tests for handling Google Sign-In response and sending to backend (TDD) - Ref: FR3
*   [x] Implement handling of Google Sign-In response and communication with backend auth - Ref: FR3, FR4
*   [x] Write tests for secure API token storage (e.g., AsyncStorage or a secure storage library for React Native) (TDD) - Ref: FR5, NF3
*   [x] Implement secure API token storage - Ref: FR5, NF3
*   [x] Write tests for Timer UI component state transitions (Initial -> Running -> Paused -> Resumed -> Stopped -> Initial) (TDD, using React Native testing library) - Ref: FR7-FR12
*   [x] Implement Timer UI component (display `00:00:00`, Start/Pause/Resume/Stop buttons) - Ref: FR7, FR8, FR9, FR10, FR11, FR12
*   [x] Write tests for timer logic (start, pause, resume, stop, time calculation, likely within a custom hook or component state) (TDD) - Ref: FR9, FR10, FR11, FR12
*   [x] Implement timer logic (custom hook or component state management) - Ref: FR9, FR10, FR11, FR12
*   [x] Write tests for sending session data to backend API on Stop (TDD, mocking the API call) - Ref: FR12, FR14
*   [x] Implement API call to `POST /api/sessions` on Stop (using fetch or a library like Axios) - Ref: FR12, FR14
*   [x] Implement handling of API responses (success/error) and UI reset - Ref: FR12, NF5

## 4. Local Testing Tasks
*   [ ] Test Google Sign-In flow end-to-end (React Native iOS -> Backend -> `Supabase`).
    *   **Testing Approach & Steps:**
        1.  **Prerequisites:**
            *   Ensure your React Native development environment is correctly set up for iOS (simulator or physical device).
            *   Confirm the backend API is deployed and accessible from your testing environment (Vercel).
            *   Ensure `Supabase` is set up, and you have access to its dashboard (particularly the Auth section and logs).
            *   Have a test Google account ready.
        2.  **Client-Side (React Native App):**
            *   Build and run the React Native application on your iOS simulator or a connected physical device.
            *   **Observe Initial State:** The app should display the "Sign in with Google" button (Ref: FR1).
            *   **Initiate Sign-In:** Tap the "Sign in with Google" button.
            *   **Google OAuth Flow:**
                *   The standard Google Sign-In UI should appear (Ref: FR2).
                *   Log in using your test Google account credentials.
                *   Grant any requested permissions.
            *   **Post Sign-In (Client):**
                *   After successful Google authentication, the app should receive a Google ID token/auth code.
                *   **Monitor App Logs/Debugger:** Check React Native logs (e.g., using `console.log` or Flipper/React Native Debugger) to see if the token is received and sent to the backend.
                *   UI should transition away from the sign-in screen.
        3.  **Backend API (Vercel):**
            *   **Monitor Vercel Logs:** Check real-time logs for your deployed backend API.
            *   Observe incoming request to `/api/auth/google` with the token (Ref: FR3).
            *   Logs should indicate token verification, user lookup/creation in `Supabase` (Ref: FR4).
            *   Confirm API session token (JWT) generation and response to client.
        4.  **Database (`Supabase`):**
            *   **Check `Supabase` Auth Dashboard:** In "Authentication" -> "Users", verify new user creation or existing user login for the test Google account.
        5.  **Client-Side (React Native App - Token Storage & UI Update):**
            *   **Monitor App Logs/Debugger:** Confirm API session token (JWT) receipt from backend and secure storage (Ref: FR5).
            *   **UI State:** App should be in a logged-in state. Test session persistence across app restarts if implemented (Ref: FR6).
        6.  **(Optional) Negative Test Cases:** Consider testing with invalid accounts, network interruptions, or invalid tokens.
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

*   **Architecture:** React Native Frontend (targeting iOS), `Node.js`/`TypeScript`/`Express.js` Backend API, `Supabase` (`PostgreSQL`) Database.
*   **Authentication:** Google OAuth handled via `Supabase` Auth is the preferred approach (Ref: DB3) to simplify backend logic. The backend will verify tokens forwarded by the React Native app.
*   **API:** RESTful API hosted on `Vercel`. Key endpoint: `POST /api/sessions`.
*   **Data Storage:** User info potentially managed by `Supabase` Auth. Session data stored in a dedicated `MeditationSessions` table with RLS enabled.

## Relevant Files

*(To be populated as development progresses)*
*   [prd_v1.md](./prd_v1.md) - Product Requirements Document
*   `implementation-plan-v1.md` - This file
*   `supabase/migrations/...` - Database schema migrations
*   `supabase/seed.sql` - (Optional) Initial data seeding
*   `backend/src/server.ts` - Main backend application file
*   `backend/src/routes/sessions.ts` - Session API route handler
*   `backend/src/services/auth.ts` - Authentication logic
*   `backend/tests/...` - Backend unit/integration tests
*   `src/App.tsx` (or `.js`) - Main application component
*   `src/screens/AuthScreen.tsx` - Google Sign-In UI/Logic
*   `src/screens/TimerScreen.tsx` - Main timer UI/Logic
*   `src/components/Timer.tsx` - Timer component
*   `src/services/api.ts` - Backend API communication
*   `src/services/authService.ts` - Authentication related services
*   `src/utils/storage.ts` - Secure token storage (e.g., using AsyncStorage or a secure storage library)
*   `src/hooks/useTimer.ts` - Custom hook for timer logic (optional, could be component state)
*   `__tests__/screens/TimerScreen.test.tsx` - Example test file for TimerScreen
*   `__tests__/components/Timer.test.tsx` - Example test file for Timer component
*   `__tests__/hooks/useTimer.test.ts` - Example test file for useTimer hook