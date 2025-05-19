# Product Requirements Document: Meditation Tracker V1 (MVP)

**1. Introduction**

* **Product:** Meditation Tracker (Working Title)
* **Version:** 1.0 (Minimum Viable Product - MVP)
* **Goal:** To provide users with a simple, focused application for their iPhones to time and log their meditation sessions using Google authentication. This MVP will be built with a React Native frontend and establishes the core functionality of session timing and data recording, forming the foundation for future enhancements.
* **Date:** May 6, 2025

**2. Goals (MVP)**

* Allow users to register and authenticate securely using their Google (Gmail) account.
* Provide a simple timer interface (stopwatch) to track the duration of a meditation session within the React Native application.
* Allow users to start, pause, resume, and stop a meditation session.
* Automatically record the start time, duration, and end date/time of each completed meditation session upon stopping.
* Store session data securely in the backend database (`Supabase`), associated with the authenticated user.
* Establish the basic technical architecture (React Native Frontend for iPhone, `Node.js`/`TypeScript` Backend API hosted on `Vercel`, `Supabase` [`PostgreSQL`] Database).
* Provide users with a quick visual summary panel on the Timer screen showing their meditation time for each of the last seven days and the average daily duration.
* Allow users to access a dedicated Analytics screen with interactive graphs for various historical ranges (last week, month, 3 months, 6 months, year, 3 years, 5 years).

**3. User Stories (MVP)**

* **As a new user,** I want to sign up/register for the app using my Google account so that I don't have to create a separate username and password.
* **As a returning user,** I want to log in to the app using my Google account so that I can access my session tracking.
* **As a logged-in user,** I want to see a simple screen with a timer display (initially `00:00:00`) and a "Start" button so that I can begin a meditation session.
* **As a logged-in user,** when I tap "Start", I want the timer to begin counting up, the session start time to be recorded internally, and the "Start" button to be replaced by "Pause" and "Stop" buttons so that I can control the active session.
* **As a logged-in user during an active session,** I want to tap "Pause" to temporarily halt the timer (e.g., for interruptions) so that the recorded duration reflects only active meditation time.
* **As a logged-in user with a paused session,** I want the "Pause" button to change to "Resume", and when I tap "Resume", I want the timer to continue counting up from where it was paused.
* **As a logged-in user during an active or paused session,** I want to tap "Stop" to end the current meditation session.
* **As a logged-in user,** when I tap "Stop", I want the session start time, the final duration of the just-completed session, and the completion date/time to be automatically saved to my account history in the backend database (`Supabase`) via the API hosted on `Vercel`.
* **As a logged-in user,** after stopping a session, I want the UI to return to the initial state (timer at `00:00:00`, "Start" button visible) so I can begin a new session if desired.
* **As a logged-in user,** I want to see a small bar graph on the Timer screen summarising my meditation duration for each of the last seven days and my average daily time so that I can quickly gauge my recent consistency.
* **As a logged-in user,** I want to tap that bar-graph panel to navigate to an Analytics screen so that I can explore my meditation data over different time periods (last week, last month, last 3 months, last 6 months, last year, last 3 years, last 5 years).
* **As a logged-in user on the Analytics screen,** I want to select one of the predefined ranges and view a graph that aggregates my daily meditation time over that period so that I can understand my long-term trends.

**4. Functional Requirements**

### 4.1 Authentication (Google Sign-In)

* **FR1:** The application must provide a "Sign in with Google" button on the initial launch screen (if not already authenticated).
* **FR2:** Tapping "Sign in with Google" must initiate the Google Sign-In OAuth flow using appropriate React Native libraries (e.g., a community-supported Google Sign-In module).
* **FR3:** The React Native app must securely send the received Google ID token or authorization code to the backend API (hosted on `Vercel`) for verification and user lookup/creation.
* **FR4:** The backend (running on `Vercel`) must verify the Google token/code, identify the user (or create a new user record if it's their first login in `Supabase`), and return an API session token (e.g., JWT) to the React Native app.
* **FR5:** The React Native app must securely store the API session token (e.g., using AsyncStorage or a secure storage solution) and include it in subsequent requests to protected backend API endpoints hosted on `Vercel`.
* **FR6:** The application should maintain the user's logged-in state across app launches until explicitly logged out (Logout functionality is out of scope for MVP V1).

### 4.2 Timer Interface & Control

* **FR7:** The main screen will display a timer. Initially, it will show `00:00:00`. The running timer display must be in HH:MM:SS (hours:minutes:seconds) format.
* **FR8:** Below the timer, a single "Start" button will be visible initially.
* **FR9:** Tapping "Start" performs the following:
    * Records the current timestamp as the `session_start_time`.
    * Starts the timer incrementing seconds upwards.
    * Hides the "Start" button.
    * Displays a "Pause" button and a "Stop" button.
* **FR10:** Tapping "Pause" performs the following:
    * Stops the timer's current count.
    * Changes the "Pause" button text/label to "Resume".
* **FR11:** Tapping "Resume" performs the following:
    * Restarts the timer incrementing from the paused time.
    * Changes the "Resume" button text/label back to "Pause".
* **FR12:** Tapping "Stop" performs the following:
    * Records the final elapsed time shown on the timer as the `duration`.
    * Sends the session data (`session_start_time`, `duration`, potentially `session_end_time`) to the backend API hosted on `Vercel` (see 4.3).
    * Resets the timer display to `00:00:00`.
    * Hides the "Pause"/"Resume" and "Stop" buttons.
    * Displays the "Start" button again.
* **FR12.1:** The Timer screen components (timer display, Start/Pause/Resume/Stop buttons, and overall layout) must be styled for improved visual appeal and user experience. Specific styling details will be provided by the user.

### 4.3 Data Persistence

* **FR13:** A backend API endpoint (e.g., `POST /api/sessions`), hosted on `Vercel`, must exist to receive session data. This endpoint must be protected and require the user's API session token.
* **FR14:** When the "Stop" button is tapped (FR12), the React Native app must make a request to the `Vercel`-hosted backend endpoint, sending the `session_start_time` (captured when "Start" was tapped), the final session `duration` (e.g., in seconds), and potentially the `session_end_time` (the backend can also generate the end time upon receiving the request).
* **FR15:** The backend (running on `Vercel`), upon receiving a valid request on the session endpoint, must:
    * Identify the authenticated user via the API session token.
    * Record a new entry in the `MeditationSessions` `Supabase` database table.
    * Store the User ID, Session Start Time, Session Duration, and Session End Time (either received or generated).
* **FR16:** The `Supabase` database schema must include at least a `MeditationSessions` table (public schema or a dedicated one) with columns such as:
    * `session_id` (Primary Key, e.g., UUID or auto-incrementing integer)
    * `user_id` (Foreign Key referencing the `Users` table or `Supabase` Auth users)
    * `session_start_time` (Timestamp with time zone, e.g., `timestamptz`)
    * `duration_seconds` (Integer)
    * `session_end_time` (Timestamp with time zone, e.g., `timestamptz`)
    * `created_at` (Timestamp with time zone, default `now()`)
* **FR17:** A `Users` table (or leveraging `Supabase` Auth `users` table) must exist to store user information linked to their Google ID, containing at least:
    * `user_id` (Primary Key, likely UUID from `Supabase` Auth)
    * `google_id` (Stored in `raw_user_meta_data` or a custom column if needed, depending on auth implementation)
    * `email` (Stored in `Supabase` Auth `users` table)
    * `created_at` (Timestamp with time zone, managed by `Supabase` Auth)
    *(Note: Exact schema might leverage Supabase Auth features directly)*

### 4.4 Analytics & Reporting (NEW)

* **FR18:** The Timer screen must display a compact "Weekly Summary" panel consisting of:
    * A bar graph with seven bars, each representing the total meditation duration for the corresponding day in the last seven calendar days (including today).
    * A textual indicator of the average daily meditation time (in minutes) across those seven days.
* **FR19:** The Weekly Summary panel must be tappable/clickable. Activating it must navigate the user to the dedicated Analytics screen.
* **FR20:** The Analytics screen must, by default, show a bar (or line) chart for the last seven days (same data as FR18) and UI controls (e.g., segmented buttons or tabs) to switch between the following ranges: last week, last month, last 3 months, last 6 months, last year, last 3 years, last 5 years.
* **FR21:** Switching ranges must update the chart to display aggregated daily meditation durations over the selected time period. Days without sessions must be treated as 0 minutes.
* **FR22:** The React Native app must retrieve the aggregated data via a protected backend API endpoint (see 4.3 & 4.4 additions) rather than computing it purely on the client.
* **FR23:** A backend API endpoint (e.g., `GET /api/analytics?range=7d`) must accept a `range` query parameter indicating the desired period (e.g., `7d`, `1m`, `3m`, `6m`, `1y`, `3y`, `5y`) and return an ordered array of daily totals plus an average value for that period.
* **FR24:** The backend must calculate daily totals by summing `duration_seconds` for each calendar day within the requested range, filling in zeros for days without sessions.
* **FR25:** The backend response must include metadata such as the range requested, start date, end date, and computed average duration seconds.

**5. Non-Functional Requirements**

* **NF1: Platform:** The frontend application must be developed using React Native, targeting iPhone devices (iOS).
* **NF2: Performance:** The UI must be responsive. Timer updates should be smooth. API calls to the `Vercel`-hosted backend should complete quickly without blocking the UI excessively.
* **NF3: Security:** Google authentication flow must be implemented securely using appropriate React Native libraries and following best practices. API communication between the React Native app and `Vercel` backend must use HTTPS. API session tokens must be handled securely on the client (e.g., using a secure storage library for React Native) and validated on the backend. User data must be stored securely in `Supabase`, leveraging its security features (Row Level Security - RLS - is highly recommended). `Vercel` deployment configurations should follow security best practices.
* **NF4: Scalability:** While the MVP targets a single user, the backend architecture (`Node.js`/`Express` on `Vercel`, `Supabase`) allows for future scaling. `Vercel` provides scalable hosting infrastructure.
* **NF5: Reliability:** Session data recording should be reliable. The application should handle potential network errors when saving session data gracefully. `Vercel` provides reliable hosting infrastructure, and `Supabase` provides managed database reliability.
* **NF6: Data Storage:** Session data must be stored persistently in the backend `Supabase` (`PostgreSQL`) database.

**6. Technology Stack**

* **Frontend:** React Native (for iPhone/iOS).
* **Backend:** `Node.js`, `Express.js`, `TypeScript`.
* **Database:** `Supabase` (Managed `PostgreSQL`).
* **Authentication:** Google OAuth 2.0 (integrated into React Native via appropriate libraries, and verified by the Node.js backend).
* **Hosting (Backend API):** `Vercel`.

**7. Database**

* **DB1:** `Supabase` (Managed `PostgreSQL`) is selected as the database provider for V1.
* **DB2:** The project will utilize `Supabase`'s features, including its `PostgreSQL` database hosting. The free tier is sufficient for the MVP.
* **DB3:** Consideration should be given to using `Supabase` Auth for handling Google Sign-In integration and user management, which can simplify the backend implementation compared to a purely custom `Node.js` auth layer. Row Level Security (RLS) policies should be implemented in `Supabase` to ensure users can only access their own session data.

**8. Deployment**

* **DEP1:** The backend API (`Node.js`/`Express`/`TypeScript` application) will be deployed to and hosted on `Vercel`.
* **DEP2:** `Vercel`'s integration features (e.g., Git integration for automated deployments) should be utilized.
* **DEP3:** The frontend React Native application will be built into an iOS application package. Distribution will occur through standard Apple channels (e.g., TestFlight for testing, Apple App Store for release). It will communicate with the backend API hosted on `Vercel`.