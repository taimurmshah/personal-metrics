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