import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "rental.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  plate TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  transmission TEXT,
  seats INTEGER,
  price_per_hour REAL NOT NULL DEFAULT 0,
  price_per_day REAL NOT NULL,
  price_per_km REAL NOT NULL DEFAULT 0,
  location TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  total_price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  pickup_location TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// Lightweight migration: add per-hour / per-km columns to existing DBs.
const cols = db.prepare("PRAGMA table_info(vehicles)").all().map((c) => c.name);
if (!cols.includes("price_per_hour")) {
  db.exec("ALTER TABLE vehicles ADD COLUMN price_per_hour REAL NOT NULL DEFAULT 0");
}
if (!cols.includes("price_per_km")) {
  db.exec("ALTER TABLE vehicles ADD COLUMN price_per_km REAL NOT NULL DEFAULT 0");
}

export default db;