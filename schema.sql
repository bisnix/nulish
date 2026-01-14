DROP TABLE IF EXISTS note_tags;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS tags;

CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  created_at INTEGER,
  FOREIGN KEY (parent_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT,
  content TEXT,
  updated_at INTEGER,
  is_pinned BOOLEAN DEFAULT 0
);

CREATE TABLE note_tags (
  note_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Seed some initial data
INSERT INTO tags (id, name, created_at) VALUES ('t1', 'Personal', 1700000000);
INSERT INTO tags (id, name, created_at) VALUES ('t2', 'Work', 1700000000);
INSERT INTO notes (id, title, content, updated_at) VALUES ('n1', 'Welcome to Nulish', '# Welcome\nThis is your first note.', 1700000000);
INSERT INTO note_tags (note_id, tag_id) VALUES ('n1', 't1');
