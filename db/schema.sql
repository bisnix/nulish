-- Schema for Nulish D1 Database

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',
  tags TEXT DEFAULT '[]', -- JSON string of tag IDs or names
  updated_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  is_pinned INTEGER DEFAULT 0 -- 0 for false, 1 for true
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES tags(id) ON DELETE CASCADE
);
