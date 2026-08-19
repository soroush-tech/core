-- Schema for a monthly contact-submissions table. The runtime fills in the month table name
-- (e.g. contacts_2026_06) in place of the placeholder below - see src/tables.ts. This file is the
-- versioned source of truth for the table's shape; change it (and ALTER existing month tables)
-- when columns change. `created_at` is an ISO 8601 string (sorts chronologically as text).
CREATE TABLE IF NOT EXISTS __TABLE__ (
  id         TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  name       TEXT NOT NULL,
  company    TEXT,
  email      TEXT NOT NULL,
  phone      TEXT,
  website    TEXT,
  project    TEXT,
  timeline   TEXT,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  consent_text TEXT NOT NULL
)