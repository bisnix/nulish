-- Nulish Database Schema
-- Last updated: 2026-01-16 (Safe migration)

DROP TABLE IF EXISTS note_tags;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS tags;

CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',
  tags TEXT DEFAULT '[]', -- JSON string of tags
  updated_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  is_pinned INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 0
);

CREATE TABLE note_tags (
  note_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
