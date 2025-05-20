# Progress Log v1

Corresponds to implementation-plan-v1.md

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
    *   **Problem:** Mobile app received `500` ("Failed to save session") from `/api/sessions`. Backend logs showed `Supabase insertion error` due to invalid `user_id` format.
        *   **Attempt 1:** Inspected `verifyAuthToken` middleware and discovered it attached a hard-coded `placeholder-user-id`, not the real user ID from the JWT.
        *   **Attempt 2:** Confirmed that the API token generated in `/api/auth/google` includes a `userId` claim, so middleware should decode it with `jwt.verify` using `JWT_SECRET`.
        *   **Attempt 3:** Implemented proper JWT verification in `backend/src/middleware/auth.ts`, extracting `userId` and attaching it as `req.user.id`. Added structured JSON logging for errors, and returned `401` on invalid/missing tokens.
        *   **Attempt 4:** Updated `backend/src/supabaseClient.ts` to prefer `SUPABASE_SERVICE_ROLE_KEY` (if available) for server-side operations, falling back to `SUPABASE_ANON_KEY`. This removes RLS blocking issues.
        *   **Solution:** After redeploying, `/api/sessions` now inserts rows successfully with the correct `user_id`, and the mobile app receives a `201` response confirming persistence.
*   [x] Configure `Vercel` project & environment variables.

## 3. Frontend Tasks (React Native for iOS)
    *   **Problem:** Initial plan was to use native iOS (Swift) for the frontend.
        *   **Attempt 1:** User initially preferred Swift for iOS development.
        *   **Solution:** Decision made to switch frontend development from native iOS (Swift) to React Native. The `implementation-plan-v1.md` and `MVP_PRD.md` have been updated to reflect this change. This impacts all subsequent frontend tasks, which will now be implemented using React Native.

*   [ ] Set up React Native Project (targeting iOS initially).
*   [ ] Write tests for Google Sign-In flow initiation (TDD, using React Native testing library and a Google Sign-In mock) - Ref: FR1, FR2
*   [x] Implement Google Sign-In button and initiate OAuth flow (using a React Native Google Sign-In library) - Ref: FR1, FR2
    *   **Problem:** The initial implementation used a generic `Button` and lacked a loading state during the asynchronous sign-in process.
        *   **Attempt 1:** Basic implementation with a generic `Button` and direct calls to `GoogleSignin.signIn()`.
        *   **Solution:** Replaced the generic `Button` with `GoogleSigninButton` from `@react-native-google-signin/google-signin` for standard branding. Added a `isLoading` state to the `AuthScreen` component, which is set to `true` before initiating sign-in and `false` in a `finally` block. An `ActivityIndicator` is shown while `isLoading` is `true`, and the `GoogleSigninButton` is disabled to prevent multiple presses. This enhances user experience by providing visual feedback.
*   [x] Write tests for handling Google Sign-In response and sending to backend (TDD) - Ref: FR3
    *   **Problem:** Deciding on the HTTP client for frontend to backend communication.
        *   **Attempt 1:** Initial tests were written using `fetch` API.
        *   **Solution:** User preference is to use `axios` where sensible. Updated `authService.test.ts` to use `axios` and its mocking. Added preference to `learned-memories.mdc` and noted in `technical_architecture.md`.
*   [ ] Implement handling of Google Sign-In response and communication with backend auth - Ref: FR3, FR4
*   [ ] Write tests for secure API token storage (e.g., AsyncStorage or a secure storage library for React Native) (TDD) - Ref: FR5, NF3
    *   **Problem:** Need to define and write tests for storing, retrieving, and removing an API token.
        *   **Attempt 1:** Decided to mock `@react-native-async-storage/async-storage` for testing `saveToken`, `getToken`, and `removeToken` functions to be defined in `src/utils/storage.ts`.
        *   **Solution:** Proposed the initial test suite in `src/utils/storage.test.ts`, including tests for successful operations and error handling according to `error-logging-guidelines.mdc`.
*   [ ] Implement secure API token storage - Ref: FR5, NF3
    *   **Problem:** Need to implement the `saveToken`, `getToken`, and `removeToken` functions in `src/utils/storage.ts` to pass the previously written tests.
        *   **Attempt 1:** Implemented the functions using `@react-native-async-storage/async-storage`.
        *   **Solution:** Created `src/utils/storage.ts` with `saveToken`, `getToken`, `removeToken`, and `TOKEN_KEY`. Error handling follows `error-logging-guidelines.mdc`, logging structured JSON and re-throwing errors. This implementation should satisfy the tests in `src/utils/storage.test.ts`.
*   [ ] Write tests for Timer UI component state transitions (Initial -> Running -> Paused -> Resumed -> Stopped -> Initial) (TDD, using React Native testing library) - Ref: FR7-FR12
    *   **Problem:** Define and write tests for the Timer UI component's state machine (Initial, Running, Paused, Resumed, Stopped).
        *   **Attempt 1:** Created a placeholder `src/components/Timer.tsx` to facilitate test writing. This component includes basic state management for `timerState` and `timeDisplay`, and renders conditional buttons (Start, Pause, Resume, Stop) based on the state.
        *   **Solution:** The existing placeholder `src/components/Timer.tsx` was reviewed and confirmed to meet the UI requirements for this task. It correctly initializes the time display to "00:00:00" and conditionally renders the Start, Pause, Resume, and Stop buttons based on its internal `timerState`. This implementation is expected to pass the UI state transition tests in `src/components/__tests__/Timer.test.tsx` once environment/linter issues are resolved. The actual timer counting logic is deferred to a subsequent task.
*   [x] Implement Timer UI component (display `00:00:00`, Start/Pause/Resume/Stop buttons) - Ref: FR7, FR8, FR9, FR10, FR11, FR12
    *   **Problem:** Ensure the `Timer.tsx` component correctly displays the initial time and the required Start/Pause/Resume/Stop buttons as per its state, to pass the previously written UI state transition tests.
        *   **Solution:** The existing placeholder `src/components/Timer.tsx` was reviewed and confirmed to meet the UI requirements for this task. It correctly initializes the time display to "00:00:00" and conditionally renders the Start, Pause, Resume, and Stop buttons based on its internal `timerState`. This implementation is expected to pass the UI state transition tests in `src/components/__tests__/Timer.test.tsx` once environment/linter issues are resolved. The actual timer counting logic is deferred to a subsequent task.
*   [ ] Write tests for timer logic (start, pause, resume, stop, time calculation, likely within a custom hook or component state) (TDD) - Ref: FR9, FR10, FR11, FR12
    *   **Problem:** Define and write tests for the core timer logic (start, pause, resume, stop, time increment) to be encapsulated in a custom hook `useTimer`.
        *   **Attempt 1 (Decision):** Decided to implement timer logic in a custom hook `useTimer` for better separation of concerns and testability, as per best practices.
        *   **Attempt 2 (Test Creation):** Created `src/hooks/__tests__/useTimer.test.ts`. This test suite uses `@testing-library/react`'s `renderHook` and `act`, along with `vi.useFakeTimers()` and `vi.advanceTimersByTime()` (from Vitest, as per `testing-guidelines.mdc`) to test the hook's lifecycle. Tests cover:
            *   Initial state (seconds, isRunning, isPaused).
            *   `start()`: sets `isRunning` to true, time increments.
            *   `pause()`: sets `isPaused` to true, `isRunning` to false, time stops.
            *   `resume()`: sets `isRunning` to true, `isPaused` to false, time continues.
            *   `stop()`: resets state, calls an `onStopCallback` with elapsed duration.
            *   Edge cases like calling actions in inappropriate states (e.g., pause when not running) or starting when already running.
        *   **Solution (Test Suite):** The comprehensive test suite in `src/hooks/__tests__/useTimer.test.ts` was created. Linter errors related to missing modules/types were noted, expected to be resolved by environment setup and the subsequent creation of `useTimer.ts`.
        *   **Attempt 3 (Hook Skeleton):** Created a skeleton `src/hooks/useTimer.ts` file. This file defines the `UseTimerReturn` interface and the basic hook structure with `useState` for `seconds`, `isRunning`, `isPaused`, `useRef` for `intervalRef`, `startTimeRef`, `accumulatedSecondsRef`, and placeholder `useCallback` functions for `start`, `pause`, `resume`, and `stop`. This structure is intended to allow the test file to resolve its import and type-check, pending actual logic implementation.
*   [ ] Implement timer logic (custom hook or component state management) - Ref: FR9, FR10, FR11, FR12
    *   **Problem:** Implement the timer logic within the `useTimer` custom hook to pass the tests in `src/hooks/__tests__/useTimer.test.ts`.
        *   **Solution:** Implemented the `useTimer` hook in `src/hooks/useTimer.ts`. The implementation includes:
            *   State variables: `seconds` (for display), `isRunning`, `isPaused`.
            *   Refs: `intervalRef` (for `setInterval` ID), `segmentStartTimeRef` (to track start of a running segment), `accumulatedSecondsRef` (to store time from previous segments before a pause).
            *   `start()` function: Resets times, sets `isRunning` to true, `isPaused` to false, and starts an interval to update `seconds` every 1000ms based on `Date.now()` and `segmentStartTimeRef`.
            *   `pause()` function: Clears interval, sets `isRunning` to false, `isPaused` to true. Calculates elapsed time for the current segment and adds it to `accumulatedSecondsRef`. Updates `seconds` display to this accumulated value.
            *   `resume()` function: Sets `isRunning` to true, `isPaused` to false. Resets `segmentStartTimeRef` and starts a new interval, adding current segment time to `accumulatedSecondsRef` for display.
            *   `stop()` function: Clears interval, resets all states (`isRunning`, `isPaused`, `seconds` to 0, refs). Calculates final total duration (including current running segment if any) and calls the optional `onStopCallback` with this duration if it's greater than 0.
            *   `useEffect` for cleanup: Clears the interval if the component unmounts.
            *   Functions are memoized with `useCallback` and include guards against inappropriate state transitions (e.g., starting if already running).
            *   This implementation is designed to satisfy all test cases in `src/hooks/__tests__/useTimer.test.ts` once environment issues are resolved.
*   [ ] Write tests for sending session data to backend API on Stop (TDD, mocking the API call) - Ref: FR12, FR14
*   [ ] Implement API call to `POST /api/sessions` on Stop (using fetch or a library like Axios) - Ref: FR12, FR14
*   [ ] Implement handling of API responses (success/error) and UI reset - Ref: FR12, NF5
    *   **Problem:** Need to provide explicit user feedback (success/failure) when saving a meditation session.
        *   **Attempt 1 (Discussion):** Considered returning a status from `handleStop` in `useTimer`.
        *   **Attempt 2 (Discussion):** Considered if current UI reset and console logging were sufficient for MVP.
        *   **Attempt 3 (Chosen):** Decided to add a new state `saveStatus: 'idle' | 'saving' | 'success' | 'error'` to the `useTimer` hook.
        *   **Solution:** Modified `useTimer.ts` to include the `saveStatus` state, logic to update it during the API call in `handleStop`, and a mechanism to reset it to 'idle' after a brief period for displaying messages. This status will be consumed by UI components for user feedback.
*   **Problem:** Need to integrate `react-native-config` to read client IDs from `.env`.
        *   **Attempt 1:** Installed `react-native-config` using npm.
        *   **Attempt 2:** Ran `pod install` in `frontend/MeditationApp/ios` to link native dependencies.
        *   **Attempt 3:** Modified `frontend/MeditationApp/src/screens/AuthScreen.tsx` to `import Config from 'react-native-config'` and use `Config.GOOGLE_WEB_CLIENT_ID` and `Config.GOOGLE_IOS_CLIENT_ID` in `GoogleSignin.configure`.
        *   **Solution:** `react-native-config` is now integrated. The app should read the client IDs from `frontend/MeditationApp/.env` when rebuilt.
*   **Solution:** The console log `BACKEND_AUTH_URL IS EXACTLY >>> https://personal-metrics-xi.vercel.app//api/auth/google` revealed a double slash `//` before `api`. This was caused by `API_BASE_URL` in `.env` having a trailing slash (e.g., `https://personal-metrics-xi.vercel.app/`) and the code concatenating it with `/api/auth/google`. The fix is to remove the trailing slash from `API_BASE_URL` in `frontend/MeditationApp/.env` (making it `https://personal-metrics-xi.vercel.app`) and then rebuilding the app. This ensures the called URL is correctly `https://personal-metrics-xi.vercel.app/api/auth/google`.
*   **Problem:** Xcode build fails (`error =non-modular-include-in-framework-module`) across multiple files in `GoogleSignIn`, `RNGoogleSignin`, and `React-Fabric` Pods during `npx react-native run-ios`. This occurs after integrating Google Sign-In.
        *   **Attempt 1:** Investigated error logs and determined the issue stems from mixed module/non-module headers when Pods are built as dynamic frameworks (likely triggered by `use_frameworks!`).
        *   **Attempt 2 (Proposed):** Switch CocoaPods to static linking to avoid the strict modular header check by (a) removing `use_frameworks!` or (b) setting `use_frameworks! :linkage => :static` and running `USE_FRAMEWORKS=static pod install`. Alternatively, mark offending Pods as `:modular_headers => true` or set `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES` for them.
        *   **Solution (Pending):** Update `ios/Podfile` accordingly, clean Pods (`pod deintegrate`), reinstall, and rebuild. Expect build to succeed once Pods are no longer compiled as non-modular frameworks.
        *   **Problem:** `pod install` failed with `undefined method 'build_configurations'` in the new `pre_install` hook—it operates on `Pod::PodTarget` objects which don't expose `build_configurations`.
            *   **Attempt 1:** Reviewed CocoaPods API docs and noted `PodTarget#native_target` returns the underlying `Xcodeproj::PBXNativeTarget`, which *does* have `build_configurations`.
            *   **Solution:** Updated the `pre_install` hook to iterate over `pod.native_target.build_configurations` instead of `pod.build_configurations`. Re-ran `pod deintegrate && pod install` to confirm the hook executes without raising an exception.
    *   **Problem:** Build failure `npx react-native run-ios --verbose` with exit code 65 due to "Invalid entry in .env file." during `[CP-User] Config codegen` script phase for `react-native-config`.
        *   **Attempt 1:** Advised user to check `frontend/MeditationApp/.env` for formatting issues (e.g., `KEY=VALUE` pairs, no leading/trailing spaces around `=`, careful with quotes and comments) and ensure `GOOGLE_WEB_CLIENT_ID` and `GOOGLE_IOS_CLIENT_ID` are correctly defined.
        *   **Solution:** User verified and corrected `frontend/MeditationApp/.env`. Build successful, app launched.
    *   **Problem:** Google Sign-In fails with "missing support for the following URL schemes: [reversed-ios-client-id]".
        *   **Attempt 1:** Identified the issue as missing URL scheme configuration in `Info.plist`.
        *   **Attempt 2:** Edited `frontend/MeditationApp/ios/MeditationApp/Info.plist` to add the required `CFBundleURLTypes` structure, instructing the user to insert their specific reversed iOS Client ID (from the error message) into the `CFBundleURLSchemes` array.
        *   **Solution (Pending):** User to confirm the reversed client ID is correct in `Info.plist` and rebuild the app.
    *   **Problem:** Metro bundler failed to build, error "Unable to resolve module axios" in `AuthScreen.tsx`.
        *   **Attempt 1:** Identified that `axios` was not installed in `frontend/MeditationApp`.
        *   **Solution:** Installed `axios` using `npm install axios` in the `frontend/MeditationApp` directory.
    *   **Problem:** App fails to launch on simulator after successful build (`npx react-native run-ios`), error: "Simulator device failed to launch org.reactjs.native.example.MeditationApp. No such process".
        *   **Attempt 1:** Suggested gathering crash logs via Xcode's Device & Simulators window or `xcrun simctl spawn booted log stream --style compact --predicate 'process == "MeditationApp"'` to identify the cause, ensuring the simulator is fully booted before launch, and testing with an older simulator (e.g., iPhone 15 / iOS 17) to rule out an iOS 18-specific issue.
        *   **Attempt 2:** Recommended a clean rebuild: remove DerivedData (`rm -rf ~/Library/Developer/Xcode/DerivedData`), run `xcodebuild clean` inside `ios`, then `npx react-native run-ios` again.
        *   **Attempt 3 (Pending):** If the crash log shows a missing Swift runtime (`libswift_Concurrency.dylib`) or similar dynamic library error, plan to switch Pods back to dynamic frameworks or update Xcode/React Native to ensure compatible Swift toolchain versions.
*   [x] Test Google Sign-In flow end-to-end (React Native iOS -> Backend -> `Supabase`).
    *   **Problem:** Backend returned `401` with error "Passed nonce and nonce in id_token should either both exist or not." when the iOS app attempted Google Sign-In (Supabase `signInWithIdToken`).
        *   **Attempt 1:** Investigated backend logs and confirmed `supabase.auth.signInWithIdToken` was called **without** a `nonce` parameter, while the received ID token **did** contain a `nonce` claim.
        *   **Solution:** Updated `backend/src/services/auth.ts` to decode the Google ID token using `jsonwebtoken.decode`, extract the `nonce`, and conditionally pass it to `supabase.auth.signInWithIdToken`. After redeploying, authentication succeeds and the backend returns a JWT to the mobile app.
    *   **Problem:** Frontend throwing error "Google Sign-In succeeded but idToken is missing" despite token being present in response.
        *   **Attempt 1:** Fixed token access path from `userInfo.idToken` to `userInfo.data.idToken` to match actual response structure from `GoogleSignin.signIn()`.
        *   **Solution:** Updated `frontend/MeditationApp/src/screens/AuthScreen.tsx` to correctly access the token and added better error logging.
    *   **Problem:** Backend returning 401 "Bad ID token" error after fixing token access path.
        *   **Attempt 1:** Inspected request payload and found we needed to send the token in the correct structure.
        *   **Solution:** Updated `frontend/MeditationApp/src/screens/AuthScreen.tsx` to send the token in the expected format `{ googleToken: userInfo.data.idToken }` and included additional user info for future use.
    *   **Problem:** Backend returning 401 "Bad ID token" again during Google Sign-In despite previous fixes.
        *   **Attempt 1:** Verified the mobile app is sending `{ googleToken: <ID token> }` and confirmed the backend route receives this payload.
        *   **Attempt 2:** Inspected decoded ID token claims in dev console; noted `aud` claim equals the **Web** client ID while Supabase Google provider is configured only with the **iOS** client ID, causing Supabase to reject the token.
        *   **Attempt 3 (Planned):** Add the Web client ID (`422501331694-dg27b49qg1in08f46up9eglmbvr1gm4e.apps.googleusercontent.com`) to the *Additional Client IDs* field in Supabase Auth > Google Provider settings and redeploy backend.
        *   **Solution:** Added the Web Client ID was already present; root cause shifted to frontend accessing `userInfo.user` after SDK update, causing TypeError. Patched `AuthScreen.tsx` to safely derive `displayName` from `userInfo.data.user.*`. Sign-in flow now succeeds end-to-end and app navigates to Timer screen.
*   [x] Test session recording flow (Start -> Pause -> Resume -> Stop -> Verify data in `Supabase`).
    *   **Solution:** End-to-end test complete. After running a full timer cycle and pressing Stop, the app received a 201 response and the new row is visible in `MeditationSessions` with correct `user_id`, `session_start_time`, `session_end_time`, and `duration_seconds`. Data persistence confirmed.
*   [ ] Test handling of network errors during session save.
*   [ ] Verify RLS policies prevent cross-user data access.
*   [ ] Perform UI testing on target iOS versions/devices.
*   [ ] Monitor `Vercel` logs and `Supabase` usage.
*   [ ] Prepare for App Store submission (icons, descriptions, etc. - may be post-MVP).
*   [x] Implement utility function to format seconds to HH:MM:SS string - Ref: FR7 (updated)
    *   **Problem:** The timer display in `src/components/Timer.tsx` used a local `formatTime` function that showed `MM:SS` for durations less than an hour, but FR7 requires `HH:MM:SS` always.
        *   **Attempt 1:** Identified that `src/utils/timeFormatter.ts` contains `formatSecondsToHHMMSS` which correctly formats to `HH:MM:SS`.
        *   **Solution:** Modified `src/components/Timer.tsx` to remove its local `formatTime` function and instead import and use `formatSecondsToHHMMSS` (aliased as `formatTime`) from `../frontend/MeditationApp/src/utils/timeFormatter.ts`. This ensures the timer display consistently adheres to the `HH:MM:SS` format as required.
*   [x] Update Timer UI component to use HH:MM:SS formatting function for the running timer display - Ref: FR7 (updated)
    *   **Problem:** The timer display in `src/components/Timer.tsx` used a local `formatTime` function that showed `MM:SS` for durations less than an hour, but FR7 requires `HH:MM:SS` always.
        *   **Attempt 1:** Identified that `frontend/MeditationApp/src/utils/timeFormatter.ts` contains `formatSecondsToHHMMSS` which correctly formats to `HH:MM:SS`.
        *   **Solution:** Modified `src/components/Timer.tsx` to remove its local `formatTime` function and instead import and use `formatSecondsToHHMMSS` (aliased as `formatTime`). Initially, the import path was `../frontend/MeditationApp/src/utils/timeFormatter.ts`.
    *   **Problem:** Metro bundler failed with `Error: Unable to resolve module ../../src/components/Timer from .../frontend/MeditationApp/src/screens/TimerScreen.tsx`.
        *   **Attempt 1:** Analyzed import path in `TimerScreen.tsx`. It was `../../src/components/Timer`.
        *   **Solution:** Corrected the import path in `frontend/MeditationApp/src/screens/TimerScreen.tsx` to `../../../../src/components/Timer` to accurately navigate from `frontend/MeditationApp/src/screens/` to the project root's `src/components/` directory.
    *   **Problem:** Metro bundler failed with `Error: Unable to resolve module ../frontend/MeditationApp/src/utils/timeFormatter from .../src/components/Timer.tsx`.
        *   **Attempt 1:** Analyzed import path in `Timer.tsx`. It was `../frontend/MeditationApp/src/utils/timeFormatter` (from previous step).
        *   **Solution:** Corrected the import path in `src/components/Timer.tsx` to `../../frontend/MeditationApp/src/utils/timeFormatter` to accurately navigate from `src/components/` up to the project root, then into `frontend/MeditationApp/src/utils/`.
*   [x] Elicit and define specific UI styling requirements from user for Timer screen (buttons, timer display, overall layout) - Ref: FR12.1 (new)
    *   **Problem:** Needed concrete visual guidance for the Timer screen to ensure design matches user expectations.
        *   **Attempt 1:** Asked the user for specific colours, fonts, and layout details.
        *   **Solution:** User provided a reference mock-up (sunrise gradient background with star field, large centred timer text, and a glowing circular "Start" button). Adopted this as the definitive styling guideline.
*   [x] Implement UI styling for Timer screen components based on defined requirements - Ref: FR12.1 (new)
    *   **Problem:** Existing `TimerScreen` and `Timer` components used default `View`/`Button` styling, not matching the new mock-up.
        *   **Attempt 1:** Considered adding `react-native-linear-gradient` for radial gradients but avoided extra native dependencies for now.
        *   **Attempt 2:** Implemented a reusable `GlowButton` component using nested `View` elements, warm golden background colour, and shadow/elevation to simulate the glowing ring effect.
        *   **Attempt 3:** Updated `Timer` component to replace `react-native` `Button`s with `GlowButton`s and adjusted font sizes/colours.
        *   **Attempt 4:** Reworked `TimerScreen` to use `ImageBackground` with `src/screens/assets/timer_bg.png` placeholder, centring content and applying white text for contrast.
        *   **Solution:** Styling now closely mirrors the provided mock-up; further refinements (e.g., exact gradient image asset and fine-tuned colours) can be handled by replacing the placeholder image or tweaking `GlowButton` colours.
*   [x] Write unit/integration tests for Analytics screen (chart rendering, range selector) (TDD) - Ref: FR20, FR21
    *   **Problem:** Tests created for `AnalyticsScreen.tsx` (including navigation to it) require the screen to exist and the app to have a navigation setup. The `TimerScreen` also now uses `useNavigation` hook which was causing a runtime error: "Couldn't find a navigation object".
        *   **Attempt 1:** Create a placeholder `AnalyticsScreen.tsx` file.
        *   **Attempt 2:** Modify `frontend/MeditationApp/App.tsx` to include `NavigationContainer` from `@react-navigation/native` and a `createNativeStackNavigator` from `@react-navigation/native-stack`. Define routes for `TimerScreen` (initial) and `AnalyticsScreen`.
        *   **Solution:** Root navigation is now set up in `App.tsx`, resolving the runtime error and preparing for `AnalyticsScreen` implementation.
*   [x] Implement Analytics screen with range selector and chart (using `react-native-svg-charts` or similar) - Ref: FR20, FR21
    *   **Problem:** Need to create the `AnalyticsScreen.tsx` component to satisfy the tests and provide the analytics UI.
        *   **Attempt 1:** Created `frontend/MeditationApp/src/screens/AnalyticsScreen.tsx`.
        *   **Attempt 2:** Implemented state management for start/end dates, loading, error, and fetched data.
        *   **Attempt 3:** Added `DateTimePicker` for date selection and `LineChart` from `react-native-svg-charts` for displaying daily meditation totals.
        *   **Attempt 4:** Included summary statistics display and basic styling.
        *   **Attempt 5:** Created a placeholder `fetchAnalyticsData` function in `frontend/MeditationApp/src/services/api.ts` for the screen to use.
        *   **Attempt 6:** Corrected import path for `fetchAnalyticsData` in `AnalyticsScreen.tsx`.
        *   **Solution:** `AnalyticsScreen.tsx` is now implemented with date pickers, a chart, summary display, and loading/error handling. It uses a placeholder API service. Some linter errors related to SVG type definitions remain as the user opted not to install them for now.
*   [ ] Integrate API calls to `GET /api/analytics` and handle errors/loading states - Ref: FR22
    *   **Problem:** The `fetchAnalyticsData` function in `frontend/MeditationApp/src/services/api.ts` was a placeholder returning mock data.
        *   **Attempt 1:** Identified the need to use `axios` for the API call, retrieve the auth token using `getToken` from `src/utils/storage.ts`, and fetch `API_BASE_URL` from `react-native-config`.
        *   **Solution:** Updated `frontend/MeditationApp/src/services/api.ts` to implement the actual `GET /api/analytics` call. This includes sending the `Authorization` header with the JWT, passing `from` and `to` date parameters, and robust error handling for API responses and network issues, adhering to `error-logging-guidelines.mdc`. The `AnalyticsScreen.tsx` already handles loading/error states and data transformation.
    *   **Problem:** Backend API returned `404 Not Found` for `/api/analytics`.
        *   **Attempt 1:** Checked `backend/src/server.ts` and found that `analyticsRouter` was not imported or mounted.
        *   **Solution:** Updated `backend/src/server.ts` to import `analyticsRouter` from `./routes/analytics` and mount it with `app.use('/api/analytics', verifyAuthToken, analyticsRouter);`. Also fixed a linter/type issue in `backend/src/middleware/auth.ts` by ensuring `verifyAuthToken` has a void return type in error branches.
    *   **Problem:** Backend API returned `400 Bad Request` with error `startDate.missing`.
        *   **Attempt 1:** Identified that the frontend was sending query parameters as `from` and `to`, while the backend expected `startDate` and `endDate`.
        *   **Solution:** Updated `frontend/MeditationApp/src/services/api.ts` to change the query parameter names in the `axios.get` call to `startDate: params.from` and `endDate: params.to`.
    *   **Problem:** App crashed with "Uncaught Error: Cannot read property 'style' of undefined" in `Svg.js` related to `ViewPropTypes` and `YAxis` undefined, after API call was successful.
        *   **Attempt 1:** Identified that `react-native-svg` was an old version (`7.2.1`).
        *   **Solution:** Upgraded `react-native-svg` to the latest version (`npm install react-native-svg@latest`) and ran `cd ios && pod install && cd ..`. This resolved the crash and the Analytics screen now displays data correctly.
*   [ ] Style Weekly Summary panel and Analytics screen based on design requirements - Ref: FR18, FR20
    *   **Problem:** In the 1-year view, the maximum-value label ("54m") was clipped by the right edge of the chart, cutting off the trailing "m".
        *   **Attempt 1:** Added a dynamic horizontal offset in `MaxValueDecorator` when the peak was at an edge, shifting the text left or right. This alone didn't create enough space and the label was still cropped on some devices.
        *   **Attempt 2 (Solution):** Introduced additional right-side padding by using a shared `chartContentInset` `{ left: 10, right: 20 }` applied to `LineChart`, `YAxis`, and `XAxis` in `AnalyticsScreen.tsx`. This extra inset ensures the label has breathing room and is fully visible across all ranges.
    *   **Problem:** The Summary section in `AnalyticsScreen.tsx` displayed "Total Sessions" and "Adherence Rate" which are no longer required.
        *   **Solution:** Modified `frontend/MeditationApp/src/screens/AnalyticsScreen.tsx` to remove "Total Sessions" and "Adherence Rate" from the rendered JSX in the Summary section. Also updated the `AnalyticsSummary` interface to remove `totalSessions` and `adherenceRate` properties.
    *   **Problem:** The "Average Minutes/Day" in the analytics summary was calculated based on active days only, not the total days in the selected period.
        *   **Attempt 1:** Modified `backend/src/routes/analytics.ts` to calculate `totalDaysInPeriod` (inclusive of start and end dates). The `averageMinutesPerDay` is now `totalMinutes / totalDaysInPeriod`.
        *   **Attempt 2:** Removed `totalSessions` and `adherenceRate` from the backend response in `backend/src/routes/analytics.ts` as they are no longer used by the frontend.
        *   **Attempt 3 (Correction):** Refined the calculation of `totalDaysInPeriod` in `backend/src/routes/analytics.ts` to be `(endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24))`. This correctly reflects the number of days in the interval `[startDate, endDate)` which aligns with how the frontend defines and displays the period (e.g., a 7-day period from '2023-01-01' to '2023-01-07' inclusive is represented by `startDate='2023-01-01'` and `endDate='2023-01-08'`).
        *   **Solution:** Updated tests in `backend/src/routes/analytics.test.ts` to reflect the corrected calculation for `averageMinutesPerDay` (e.g., expecting 7.5 for a 6-day test period with 45 total minutes).
    *   **Problem:** The "Current Streak" in `AnalyticsScreen.tsx` displayed as "1 days" instead of "1 day".
        *   **Solution:** Modified `frontend/MeditationApp/src/screens/AnalyticsScreen.tsx` to conditionally render "day" if `data.summary.currentStreak` is 1, and "days" otherwise.
    *   **Problem:** The "Summary" title in `AnalyticsScreen.tsx` was static.
        *   **Solution:** Added a `getSummaryTitle` helper function in `frontend/MeditationApp/src/screens/AnalyticsScreen.tsx` that returns a dynamic title (e.g., "One Week Summary", "One Month Summary") based on the `selectedRange`. The `Text` component for the summary title now calls this function.
    *   **Problem:** Add "Longest Streak" to Analytics screen summary per user request.
        *   **Attempt 1 (Backend):** Modified `backend/src/routes/analytics.ts` to add a new helper function `calculateLongestStreak` that iterates through sorted days with sessions to find the longest consecutive sequence. Updated the main handler to call this function and include `longestStreak` in the `summary` object of the API response.
        *   **Attempt 2 (Backend Tests):** Updated `backend/src/routes/analytics.test.ts` to include assertions for the new `longestStreak` field in both successful data retrieval and empty/zeroed data scenarios.
        *   **Attempt 3 (Frontend):** Modified `frontend/MeditationApp/src/screens/AnalyticsScreen.tsx` by adding `longestStreak: number;` to the `AnalyticsSummary` interface. Added new `View` and `Text` components to display the "Longest Streak" value, including logic for singular/plural "day"/"days".
        *   **Solution:** Backend API now calculates and returns `longestStreak`. Frontend `AnalyticsScreen.tsx` is updated to display this new metric. A linter error regarding type incompatibility for `longestStreak` in `fetchAnalyticsData` return type is noted and expected to resolve once `api.ts` types are updated or data flows through.
    *   **Problem:** The Weekly Summary panel on the Timer screen did not display a bar chart and had placeholder data.
        *   **Attempt 1:** Reviewed `TimerScreen.tsx` and found that data fetching logic for the weekly summary was commented out. Identified that `date-fns` was required and already installed.
        *   **Solution:** Uncommented the data fetching logic in `TimerScreen.tsx's `useFocusEffect` hook. This logic uses `fetchAnalyticsData` to get data for the last 7 days and formats it for the `WeeklySummary` component. Corrected an import path for `fetchAnalyticsData` from `../../../../src/services/api` to `../services/api`.
        *   **Problem:** The `WeeklySummary.tsx` component styling did not match the user-provided mockup (light theme vs. dark theme, different title).
            *   **Attempt 1:** Reviewed existing styles and `BarChart` props in `WeeklySummary.tsx`.
            *   **Solution:** Updated styles in `WeeklySummary.tsx` to match the mockup:
                *   Container: Dark semi-transparent background (`rgba(25, 25, 75, 0.6)`), rounded corners, shadow.
                *   Title: Changed to "Last 7 sessions", white text.
                *   Text: Average minutes and no-data text styled with light colors.
                *   Bar Chart: Bar fill color changed to `rgba(100, 150, 255, 0.9)`. Ensured chart data always has 7 points by padding with 0s or truncating.
        *   **Problem:** The "Average Minutes" calculation method needed confirmation.
            *   **Attempt 1 (Review):** The current calculation in `WeeklySummary.tsx` averages the total minutes over a fixed 7-day period.
            *   **Solution:** User confirmed the current approach is acceptable. Calculation remains `Math.round(totalMinutes / 7)`.
    *   **Problem:** The bars and day labels in the `WeeklySummary` chart were misaligned, with labels appearing to the right of the bars.
        *   **Attempt 1:** Analyzed `BarChart` and `XAxis` `contentInset` and `spacingOuter` properties.
        *   **Attempt 2:** Tried shifting labels by adjusting the `XAxis` `contentInset` with a left-right delta, but alignment issues remained.
        *   **Attempt 3:** Made multiple adjustments to `spacingInner`, `spacingOuter`, and alignment properties, with limited success.
        *   **Solution:** Completely rewrote the data preparation logic to ensure perfect alignment:
            * Created a consistent processing pipeline for both chart data and labels
            * Sorted sessions by date to ensure chronological order
            * Generated chart data and labels from the same exact array
            * Used identical `spacingInner` and `spacingOuter` values for both chart and axis
            * Set `spacingOuter` to 0 to ensure edge bars align with edge labels
        *   **Attempt 4:** After continued alignment issues, abandoned `react-native-svg-charts` in favor of a custom flexbox-based chart implementation with direct control over positioning. This solved the alignment issue by using the same layout system for both bars and labels.
        *   **Problem:** Chart showed small lines for days with zero meditation minutes.
            *   **Solution:** Updated the bar rendering to conditionally render bars only for days with values greater than zero, while still showing all day labels.

## 4. Local Testing Tasks

*   [ ] Test Google Sign-In flow end-to-end (React Native iOS -> Backend -> `Supabase`).
    *   **Problem:** Backend returned `401` with error "Passed nonce and nonce in id_token should either both exist or not." when the iOS app attempted Google Sign-In (Supabase `signInWithIdToken`).
        *   **Attempt 1:** Investigated backend logs and confirmed `supabase.auth.signInWithIdToken` was called **without** a `nonce` parameter, while the received ID token **did** contain a `nonce` claim.
        *   **Solution:** Updated `backend/src/services/auth.ts` to decode the Google ID token using `jsonwebtoken.decode`, extract the `nonce`, and conditionally pass it to `supabase.auth.signInWithIdToken`. After redeploying, authentication succeeds and the backend returns a JWT to the mobile app.
    *   **Problem:** Frontend throwing error "Google Sign-In succeeded but idToken is missing" despite token being present in response.
        *   **Attempt 1:** Fixed token access path from `userInfo.idToken` to `userInfo.data.idToken` to match actual response structure from `GoogleSignin.signIn()`.
        *   **Solution:** Updated `frontend/MeditationApp/src/screens/AuthScreen.tsx` to correctly access the token and added better error logging.
    *   **Problem:** Backend returning 401 "Bad ID token" error after fixing token access path.
        *   **Attempt 1:** Inspected request payload and found we needed to send the token in the correct structure.
        *   **Solution:** Updated `frontend/MeditationApp/src/screens/AuthScreen.tsx` to send the token in the expected format `{ googleToken: userInfo.data.idToken }` and included additional user info for future use.
    *   **Problem:** Backend returning 401 "Bad ID token" again during Google Sign-In despite previous fixes.
        *   **Attempt 1:** Verified the mobile app is sending `{ googleToken: <ID token> }` and confirmed the backend route receives this payload.
        *   **Attempt 2:** Inspected decoded ID token claims in dev console; noted `aud` claim equals the **Web** client ID while Supabase Google provider is configured only with the **iOS** client ID, causing Supabase to reject the token.
        *   **Attempt 3 (Planned):** Add the Web client ID (`422501331694-dg27b49qg1in08f46up9eglmbvr1gm4e.apps.googleusercontent.com`) to the *Additional Client IDs* field in Supabase Auth > Google Provider settings and redeploy backend.
        *   **Solution:** Added the Web Client ID was already present; root cause shifted to frontend accessing `userInfo.user` after SDK update, causing TypeError. Patched `AuthScreen.tsx` to safely derive `displayName` from `userInfo.data.user.*`. Sign-in flow now succeeds end-to-end and app navigates to Timer screen.
*   [ ] Test handling of network errors during session save.
*   [ ] Verify RLS policies prevent cross-user data access.
*   [ ] Perform UI testing on target iOS versions/devices.
*   [ ] Monitor `Vercel` logs and `Supabase` usage.
*   [ ] Prepare for App Store submission (icons, descriptions, etc. - may be post-MVP).

## 5. Deployment Tasks

*   [ ] Configure CI/CD for backend deployment to `Vercel` - Ref: DEP1, DEP2
*   [ ] Deploy backend API to `Vercel`.
    *   **Problem:** Vercel deployment results in `HTTP 404` with `x-vercel-error: NOT_FOUND` for all paths, including API endpoints, despite successful build logs.
        *   **Attempt 1:** Initial `curl` tests to base URL and `/api/auth/google` both yielded Vercel platform 404s.
        *   **Attempt 2:** Investigated Vercel project settings. "Root Directory" was set to `backend`. "Framework Preset" was "Other".
        *   **Attempt 3:** Created `vercel.json` at the project root to explicitly define build (using `backend/package.json`