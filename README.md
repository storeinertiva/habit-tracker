# Excel Habit Tracker Storefront

A simple, secure, responsive storefront to sell a downloadable Excel habit tracker with email automation and subtle UI animations.

## Features
- Minimal landing page with pricing and preview mockup
- Buy button redirects to Razorpay Payment Link
- Post-payment redirect to `/download`
- Download page with direct file download button

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
   - Copy `.env.example` to `.env` (optional for this simplified payment-link flow)
3. Replace assets
   - Preview mockup: `public/assets/mockup.png`
   - Excel file: `uploads/habit-tracker.xlsx`
4. Run the server
   - `npm start`
5. Open
   - http://localhost:3000

## API Endpoints
- `GET /api/health`
  - Health check
- `GET /download`
  - Download landing page after payment redirect

## Razorpay Payment Link Setup
1. Create a payment link in Razorpay for ₹54.
2. Set redirect URL in Razorpay to:
   - `https://my.inertiva.shop/download`
3. Copy the payment link URL.
4. Open `/Users/shubham/Documents/New project/habit-tracker/public/app.js`
5. Replace:
   - `const PAYMENT_LINK = 'PASTE_RAZORPAY_PAYMENT_LINK_HERE';`
   with your actual Razorpay payment link.

## Change Price
- Update the visual price in `/Users/shubham/Documents/New project/habit-tracker/public/index.html`
- Update the amount configured in your Razorpay Payment Link dashboard

## Security Notes
- Download file is publicly accessible at `/files/habit-tracker.xlsx`
- This setup does not perform server-side payment verification

## Optional Enhancements (not implemented)
- Add server-side payment verification via Razorpay webhooks
- Download link expiry or single-use tokens
- Analytics tracking
