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
  db.all('PRAGMA table_info(buyers)', [], (pragmaErr, columns) => {
    if (pragmaErr) return;

    const existing = new Set(columns.map((col) => col.name));
    const addColumn = (name, sqlType) => {
      if (!existing.has(name)) {
        db.run(`ALTER TABLE buyers ADD COLUMN ${name} ${sqlType}`);
      }
    };

    addColumn('payment_order_id', 'TEXT');
    addColumn('payment_id', 'TEXT');
    addColumn('payment_signature', 'TEXT');
  });
});

module.exports = db;
