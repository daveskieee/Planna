const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_DIR = path.join(__dirname);
const DB_PATH = path.join(DB_DIR, 'planna.db');
const SCHEMA = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

if (fs.existsSync(DB_PATH)) {
  console.log('Database already exists at', DB_PATH);
  process.exit(0);
}

const db = new sqlite3.Database(DB_PATH);
db.exec(SCHEMA, (err) => {
  if (err) {
    console.error('Failed to initialize DB:', err.message);
    process.exit(1);
  }
  console.log('Initialized database at', DB_PATH);
  db.close();
});
