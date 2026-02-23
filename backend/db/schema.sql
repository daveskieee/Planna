PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Events (
  id INTEGER PRIMARY KEY,
  event_date DATE NOT NULL,
  type TEXT,
  client_id INTEGER,
  guests INTEGER,
  price REAL,
  status TEXT CHECK(status IN ('Pending','Confirmed','Done')) DEFAULT 'Pending',
  event_total REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(client_id) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS Financials (
  id INTEGER PRIMARY KEY,
  event_id INTEGER UNIQUE,
  amount REAL,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(event_id) REFERENCES Events(id)
);

CREATE TABLE IF NOT EXISTS Analytics (
  id INTEGER PRIMARY KEY,
  metric_date DATE,
  predicted_income REAL,
  confidence_score REAL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_date ON Events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_client ON Events(client_id);
