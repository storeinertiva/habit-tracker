# Excel Habit Tracker Storefront

A simple, secure, responsive storefront to sell a downloadable Excel habit tracker with email automation and subtle UI animations.

## Features
- Minimal landing page with pricing and preview mockup
- Modal-based purchase flow with validation
- Manual QR payment step
- Secure tokenized download endpoint (no public file URL)
- Automated email delivery via Nodemailer
- SQLite database to store buyer data

## Folder Structure
- `public/` Frontend assets (HTML, CSS, JS, images)
- `uploads/` Private downloadable file (not publicly served)
- `db/` SQLite database file
- `server.js` Express server and API endpoints
- `mailer.js` Nodemailer email logic
- `db.js` SQLite schema and setup

## Setup
1. Install dependencies
   - `npm install`
2. Create your environment file
   - Copy `.env.example` to `.env`
   - Update SMTP credentials and sender info
3. Replace assets
   - QR code image: `public/assets/qr-placeholder.svg`
   - Preview mockup: `public/assets/mockup.svg`
   - Excel file: `uploads/habit-tracker.xlsx`
4. Run the server
   - `npm start`
5. Open
   - http://localhost:3000

## API Endpoints
- `POST /api/buyers`
  - Body: `{ "fullName": "...", "email": "..." }`
  - Response: `{ buyerId }`
- `POST /api/confirm`
  - Body: `{ "buyerId": 1 }`
  - Response: `{ success: true, downloadUrl: "/download/<token>" }`
- `GET /download/:token`
  - Secure download (tokenized)

## Database
SQLite file is created at `db/store.db`. The schema:
- `buyers`: id, full_name, email, created_at, paid_at, download_token

To view stored buyers:
- Open `db/store.db` with any SQLite browser
- Or use `sqlite3 db/store.db "SELECT * FROM buyers;"`

## Email Automation
- Uses Nodemailer with SMTP config from `.env`
- Update sender email in `.env` (`FROM_EMAIL`)
- Update email text with `EMAIL_TEXT`
- Replace attachment in `uploads/habit-tracker.xlsx`

## Admin Dashboard
- Protected with Basic Auth at `/admin`
- Configure credentials in `.env`:
  - `ADMIN_USER`
  - `ADMIN_PASS`

## Change Price
- Update the price in `public/index.html` (search for `$12`)
- Update payment instructions in the modal text if needed

## Security Notes
- Excel file is not publicly accessible
- Download only works with a unique token
- Manual payment confirmation is assumed

## Optional Enhancements (not implemented)
- Admin dashboard to review buyers
- Payment gateway integration
- Download link expiry or single-use tokens
- Analytics tracking
