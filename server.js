require('dotenv').config();

const crypto = require('crypto');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const db = require('./db');
const { sendPurchaseEmail } = require('./mailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function requireAdminAuth(req, res, next) {
  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;

  if (!adminUser || !adminPass) {
    return res.status(500).send('Admin credentials not configured.');
  }

  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) {
    res.setHeader('WWW-Authenticate', 'Basic realm=\"Admin\"');
    return res.status(401).send('Authentication required.');
  }

  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const [user, pass] = decoded.split(':');
  if (user !== adminUser || pass !== adminPass) {
    res.setHeader('WWW-Authenticate', 'Basic realm=\"Admin\"');
    return res.status(401).send('Invalid credentials.');
  }

  return next();
}

// Save buyer details
app.post('/api/buyers', (req, res) => {
  const { fullName, email } = req.body || {};

  if (!fullName || !email) {
    return res.status(400).json({ error: 'Full name and email are required.' });
  }

  const createdAt = new Date().toISOString();
  const sql = 'INSERT INTO buyers (full_name, email, created_at) VALUES (?, ?, ?)';

  db.run(sql, [fullName, email, createdAt], function onInsert(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to save buyer.' });
    }

    return res.json({ buyerId: this.lastID });
  });
});

// Confirm payment and send email
app.post('/api/confirm', (req, res) => {
  const { buyerId } = req.body || {};

  if (!buyerId) {
    return res.status(400).json({ error: 'buyerId is required.' });
  }

  const token = crypto.randomBytes(24).toString('hex');
  const paidAt = new Date().toISOString();

  db.get('SELECT * FROM buyers WHERE id = ?', [buyerId], async (err, buyer) => {
    if (err || !buyer) {
      return res.status(404).json({ error: 'Buyer not found.' });
    }

    db.run(
      'UPDATE buyers SET paid_at = ?, download_token = ? WHERE id = ?',
      [paidAt, token, buyerId],
      async (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ error: 'Failed to confirm payment.' });
        }

        try {
          await sendPurchaseEmail({ toEmail: buyer.email, toName: buyer.full_name });
        } catch (mailErr) {
          return res.status(500).json({ error: 'Payment confirmed but email failed.' });
        }

        return res.json({
          success: true,
          downloadUrl: `/download/${token}`
        });
      }
    );
  });
});

// Secure download endpoint
app.get('/download/:token', (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).send('Invalid token.');
  }

  db.get('SELECT id FROM buyers WHERE download_token = ?', [token], (err, row) => {
    if (err || !row) {
      return res.status(404).send('Download link not found.');
    }

    const filePath = path.join(__dirname, 'uploads', 'habit-tracker.xlsx');
    return res.download(filePath, 'habit-tracker.xlsx');
  });
});

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Basic admin dashboard (protected)
app.get('/admin', requireAdminAuth, (req, res) => {
  db.all('SELECT * FROM buyers ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).send('Failed to load buyers.');
    }

    const tableRows = rows
      .map(
        (row) =>
          `
          <tr>
            <td>${row.id}</td>
            <td>${row.full_name}</td>
            <td>${row.email}</td>
            <td>${row.created_at}</td>
            <td>${row.paid_at || '-'}</td>
          </tr>`
      )
      .join('');

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin - Buyers</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f7f6f2; color: #1e2a25; padding: 24px; }
      h1 { margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; background: #fff; }
      th, td { padding: 12px; border-bottom: 1px solid #e3e8e4; text-align: left; }
      th { background: #edf3ee; }
      tr:hover { background: #f6faf7; }
    </style>
  </head>
  <body>
    <h1>Buyer Records</h1>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Created At</th>
          <th>Paid At</th>
        </tr>
      </thead>
      <tbody>${tableRows || '<tr><td colspan="5">No records yet.</td></tr>'}</tbody>
    </table>
  </body>
</html>`;

    return res.send(html);
  });
});

// Ensure API misses never fall through to HTML/default responses.
app.use('/api', (_req, res) => {
  return res.status(404).json({ error: 'API route not found.' });
});

// Ensure API exceptions return JSON in production.
app.use((err, req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ error: 'Internal server error.' });
  }

  return next(err);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
