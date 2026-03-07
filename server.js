require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Public file download path after Razorpay redirect.
app.use('/files', express.static(path.join(__dirname, 'uploads')));

app.get('/download', (_req, res) => {
  return res.sendFile(path.join(__dirname, 'public', 'download.html'));
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', (_req, res) => {
  return res.status(404).json({ error: 'API route not found.' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
