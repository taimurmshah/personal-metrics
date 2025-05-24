# Meditation Tracker V1 (MVP) - Implementation Plan v1

Based on the [prd_v1.md](./prd_v1.md). This plan outlines the steps to build the Minimum Viable Product for the Meditation Tracker iOS application.

## 1. Database Tasks (`Supabase`/`PostgreSQL`)
*   [x] Define `Users` table schema (or confirm `Supabase` Auth structure suffices) - Ref: FR17
*   [x] Define `MeditationSessions` table schema - Ref: FR16
*   [x] Set up `Supabase` project.
*   [x] Implement `Supabase` Row Level Security (RLS) policies for `MeditationSessions` (users can only access their own data) - Ref: NF3, DB3
*   [x] Set up `Supabase` Auth for Google Sign-In - Ref: FR1-FR6, DB3
*   [n/a] (Optional) Create a database view or SQL function to aggregate `MeditationSessions` by day for faster analytics queries (e.g., `daily_user_meditation_minutes`) - Ref: FR24 (Skipped per user)

## 2. Backend Tasks (`Node.js`/`TypeScript` on `Vercel`)
*   [x] Set up `Node.js`/`TypeScript` project (`Express.js`).
*   [x] Write unit tests for Google Auth verification & user handling (TDD) - Ref: FR4
*   [x] Implement Google Auth verification & user handling logic (potentially leveraging `Supabase` Auth) - Ref: FR4
*   [x] Write unit tests for `POST /api/sessions` endpoint (data validation, user auth) (TDD) - Ref: FR13, FR15
*   [x] Implement `POST /api/sessions` endpoint to receive and store session data in `Supabase` - Ref: FR13, FR14, FR15
*   [x] Configure `Vercel` project & environment variables.
*   [x] Write unit tests for `GET /api/analytics` endpoint (range validation, user auth, data aggregation) (TDD) - Ref: FR23, FR24, FR25
*   [x] Implement `GET /api/analytics` endpoint to return aggregated meditation stats - Ref: FR23, FR24, FR25
*   [x] Write unit tests for email allow list functionality (TDD) - Ref: User Request
*   [x] Implement email allow list for Google Sign-In (backend) - Ref: User Request
*   [x] Style Weekly Summary panel and Analytics screen based on design requirements - Ref: FR18, FR20
    *   [x] **Weekly Summary Panel (Timer Screen):**
        *   [x] Uncomment and verify data fetching logic for Weekly Summary in `TimerScreen.tsx` (ensure `date-fns` is installed and imported).
        *   [x] Style `WeeklySummary.tsx` component (bar chart, titles, text, background) to match mockup design (dark theme, specific colors, "Last 7 days" title).
        *   [x] Review and confirm "Average Minutes" calculation in `WeeklySummary.tsx` (e.g., average over 7 days vs. average per session).
        *   [x] Update "Average Minutes" to "Daily Average" in `WeeklySummary.tsx`.
        *   [x] Add day-of-the-week labels (e.g., Mon, Tue) to the X-axis of the bar chart in `WeeklySummary.tsx`.
    *   [x] **Analytics Screen:**
        *   [x] Style Analytics screen components to meet any outstanding design requirements.
        *   [x] Update "Total Minutes" to "Total Time" and format as Xh Ym (e.g., 4h 28m) in the Analytics summary pane.
        *   [x] Update "Avg. Minutes/Day" to "Daily Average" and format as Xh Ym in the Analytics summary pane.
*   [x] Add "Longest Streak" to Analytics screen summary (Backend & Frontend) - Ref: User Request

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
*   [x] Write unit tests for utility function to format seconds to HH:MM:SS string (TDD) - Ref: FR7 (updated)
*   [x] Implement utility function to format seconds to HH:MM:SS string - Ref: FR7 (updated)
*   [x] Update Timer UI component to use HH:MM:SS formatting function for the running timer display - Ref: FR7 (updated)
*   [x] Elicit and define specific UI styling requirements from user for Timer screen (buttons, timer display, overall layout) - Ref: FR12.1 (new)
*   [x] Implement UI styling for Timer screen components based on defined requirements - Ref: FR12.1 (new)
*   [x] Add/Update tests for styled Timer screen components (e.g., snapshot tests of components) - Ref: FR12.1 (new)
*   [x] Write unit/integration tests for Weekly Summary panel component (TDD) - Ref: FR18, FR19
*   [x] Implement Weekly Summary panel component on Timer screen (bar graph + average) - Ref: FR18
*   [x] Write unit/integration tests for navigation from Timer screen to Analytics screen (TDD) - Ref: FR19
*   [x] Implement navigation from Timer screen to Analytics screen - Ref: FR19
*   [x] Write unit/integration tests for Analytics screen (chart rendering, range selector) (TDD) - Ref: FR20, FR21
*   [x] Implement Analytics screen with range selector and chart (using `react-native-svg-charts` or similar) - Ref: FR20, FR21
*   [x] Integrate API calls to `GET /api/analytics` and handle errors/loading states - Ref: FR22
*   [x] Refresh Weekly Summary data on Timer screen after a session is successfully saved.

## 4. Local Testing Tasks
*   [x] Test Google Sign-In flow end-to-end (React Native iOS -> Backend -> `Supabase`).
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
*   [x] Test session recording flow (Start -> Pause -> Resume -> Stop -> Verify data in `Supabase`).
*   [x] Test handling of network errors during session save. (User confirmed tested earlier)
*   [n/a] Verify RLS policies prevent cross-user data access. (Skipped by user, n=1 user base)
*   [n/a] Perform UI testing on target iOS versions/devices. (Skipped by user, primary user on modern device)
*   [x] Test Weekly Summary panel data accuracy against backend for last 7 days.
*   [x] Test Analytics screen range selector and chart data accuracy.

## 5. Deployment Tasks
*   [x] Configure CI/CD for backend deployment to `Vercel` - Ref: DEP1, DEP2 (Vercel default Git integration sufficient for MVP)
*   [x] Deploy backend API to `Vercel`.
*   [ ] Set up TestFlight for iOS app distribution - Ref: DEP3
    *   [ ] Create new app in App Store Connect
    *   [ ] Configure app information (name, bundle ID)
    *   [ ] Set up TestFlight settings
*   [x] Build and distribute iOS app via TestFlight
    *   [x] Update bundle identifier in Xcode
    *   [x] Configure signing certificates
    *   [x] Build app for TestFlight
    *   [x] Upload build to App Store Connect
    *   [ ] Submit for TestFlight review
*   [ ] Monitor `Vercel` logs and `Supabase` usage.
*   [ ] Prepare for App Store submission (icons, descriptions, etc. - may be post-MVP).

## Implementation Details

*   **Architecture:** React Native Frontend (targeting iOS), `Node.js`/`TypeScript`/`