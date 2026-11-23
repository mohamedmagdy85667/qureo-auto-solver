CREATE TABLE IF NOT EXISTS answers (
  question_hash TEXT PRIMARY KEY,
  language TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TEXT NOT NULL
);
