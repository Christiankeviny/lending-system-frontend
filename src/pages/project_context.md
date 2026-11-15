# Project Context: Lending System

## 1. Architecture Overview
This is a full-stack application designed to manage the borrowing and returning of laboratory equipment, handling relationships between students, lecturers, classes, and inventory. It follows a classic **Layered Monolith** architecture.

*   **Backend (`d:\Code\JAVASCRIPT\server\express`)**: A single Node.js/Express server that handles all business logic. Code is organized by technical layers (`controllers`, `services`, `routes`).
*   **Frontend (`d:\Code\JAVASCRIPT\frontEnd\lendingSystemApplication`)**: A React-based Single Page Application (SPA) that serves as the user interface for both students and administrators.
*   **Database (`lending_system_db_test`)**: A single MySQL/MariaDB database shared by all backend services.

## 2. Core Technologies
*   **Backend**: Node.js, Express.js, `mysql2` for database access, `bcryptjs` for password hashing, `jsonwebtoken` for authentication, `socket.io` for real-time communication.
*   **Frontend**: React, Vite, TailwindCSS, Recharts for charts, `socket.io-client` for real-time updates.
*   **Development**: `nodemon` for backend auto-reloading, `dotenv` for environment variable management.

## 3. Key Features & Logic

### Real-time Communication (`socket.io`)
*   The system uses WebSockets to push real-time updates from the backend to the frontend.
*   **Use Cases**:
    *   Broadcasting new borrow requests to all connected admins.
    *   Notifying admins when a request is processed, rejected, or automatically expired.
    *   Updating inventory status and history logs across all admin dashboards simultaneously.
    *   Providing live feedback to the student/borrower on the status of their request (`pending`, `accepted`, `completed`, `rejected`).

### Borrowing & Returning Workflow
1.  **Request**: A student or lecturer fills out a form on the `/borrow` page, selecting items and specifying the class schedule.
2.  **Pending**: The request is created with a `pending` status and a 15-minute countdown timer. Admins are notified in real-time.
3.  **Acceptance**: An admin accepts the request. The borrower is notified, and their status changes to `accepted`, indicating they should proceed with barcode scanning.
4.  **ID Card Photo**: For student loans, the admin captures a photo of the student's ID card using a webcam, which is stored in the `mahasiswa` table (`foto` LONGBLOB).
5.  **Checkout**: The admin scans the item's barcode. The transaction is marked as `dipinjam`, and the item's status in the `inventory` table is updated.
6.  **Return**: An admin scans the item's barcode to process a return. The transaction is marked as `dikembalikan`, the item's status is set back to `tersedia`, and the student's ID card photo is cleared from the database.
7.  **Automation**:
    *   A MySQL procedure (`CleanupExpiredRequests`) or a server-side timer automatically rejects `pending` requests if the borrower doesn't show up within 15 minutes.
    *   A server-side cron job periodically checks for overdue items (`dipinjam` status past the due date) and updates their status to `terlambat`.

### Admin Authentication & Security
*   **Login**: Admins log in with a username and password. Successful authentication returns a JWT.
*   **Authorization**: The JWT is sent in the `Authorization` header for all protected API routes. A middleware (`authMiddleware.mjs`) validates the token.
*   **Forgot/Reset Password**:
    *   Admins can request a password reset via their email address.
    *   The backend generates a secure, single-use random token (`crypto.randomBytes`) and stores it with an expiry time in the `admin_users` table.
    *   A reset link containing the token is sent to the admin (currently mocked via `console.log`).
    *   The user clicks the link, enters a new password, and the backend validates the token before updating the password hash.

## 4. Recently Implemented Features (Where we left off)
*   **Admin Forgot/Reset Password Flow:**
    *   Added `email`, `reset_token`, and `reset_token_expiry` columns to the `admin_users` table.
    *   Implemented the full backend logic using secure, single-use tokens stored in the database, which is considered a best practice for this feature over stateless JWTs.
    *   Created the frontend UI, including a "Forgot Password" modal on the `LoginPage` and a new `ResetPasswordPage` for handling the reset token.
    *   Integrated internationalization (i18n) for all success and error messages by having the backend send translation keys (e.g., `"forgotPassword.error.emailNotFound"`) instead of hardcoded text.

*   **Webcam Photo Capture & Viewing:** When an admin processes a student's loan, the app captures their ID card photo via webcam. This photo can be viewed from the `AdminHistoryLog` page by clicking the borrower's name, which opens the `BorrowerPhotoModal.jsx` modal. The photo is cleared from the database upon item return.

*   **Full Internationalization (i18n):** The entire frontend application has been refactored to support multiple languages (English and Indonesian). This was achieved by:
    *   Creating a `TranslationContext.jsx` to hold all translation strings in a central dictionary.
    *   Implementing a `useTranslation` hook to provide a `t()` function for accessing translations.
    *   Replacing all hardcoded text across all pages and components (`AdminDashboard`, `AdminHistoryLog`, `AdminInventory`, `LandingPage`, `LoginPage`, modals, etc.) with calls to the `t()` function.

*   **Visual Analytics:** The Admin Dashboard now features dynamic charts powered by Recharts:
    *   A **Daily Summary** bar chart showing items borrowed and returned today.
    *   An **Inventory Condition** pie chart summarizing the status of items (Useable, Broken, Lost), which can be filtered by item type via a dropdown menu.

*   **Environment Variables Setup:** Refactored hardcoded API URLs (e.g., `http://localhost:3000`) into a `.env` file for easier environment swapping and deployment.

*   **UI/UX Improvements & Code Cleanup:**
    *   Introduced a reusable `SearchableSelect` component to make finding classes, lecturers, and items in the lending modals much easier.
    *   Streamlined the top navigation `Header` by removing unused search bars and adding an interactive flag-based language toggle.
    *   Fixed image loading bugs on nested routes by properly importing local assets in React.
    *   Refactored the Dashboard's "Inventory Log" to pull from the transaction history, displaying a lifecycle view of recent checkouts (Promised Time, Returned Time, and Status).
    *   Improved table UX by clearly labeling active/overdue items as "Unreturned" instead of showing a confusing "N/A" for the return time.
    *   Fixed a bug where clicking pagination buttons would instantly scroll the user back to the top of the page. Pagination now seamlessly updates data in place without losing scroll position.
    *   Aligned the Landing Page and Login Page layouts perfectly so the application logo doesn't shift when transitioning between them.
    *   Upgraded the "Inventory Condition" Pie Chart to be a seamless 360-degree circle. Replaced the hover tooltip with an interactive clickable side-panel that breaks down items by specific categories (e.g., Laptops: 2).
    *   Implemented real-time countdown timer tracking inside the "Pending Borrow Requests" table.
    *   Fixed API payload handling for rejecting borrow requests.
    *   Expanded multi-language translations (e.g., Sidebar titles).

## 5. Next Possible Features/Improvements
*   **Automated Notifications:** Send email or WhatsApp reminders for overdue items.
*   **Full `nodemailer` Integration**: Replace the `console.log` mock for password resets with a real email-sending implementation using a service like Gmail or SendGrid.

agy --conversation=35b38af0-6561-43b1-b14c-f79f447ab7af