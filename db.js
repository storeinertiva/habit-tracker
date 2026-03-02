const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'db', 'store.db');
const db = new sqlite3.Database(dbPath);

// Initialize schema
const initSql = `
CREATE TABLE IF NOT EXISTS buyers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL,
  paid_at TEXT,
  download_token TEXT
);
`;

db.serialize(() => {
  db.run(initSql);
});

module.exports = db;
