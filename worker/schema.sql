CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  contact TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  category TEXT DEFAULT 'Other',
  stage TEXT DEFAULT 'New Lead',
  value REAL DEFAULT 0,
  city TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  source TEXT DEFAULT 'manual',
  created TEXT NOT NULL,
  updated TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  due TEXT DEFAULT '',
  leadId TEXT DEFAULT '',
  done INTEGER DEFAULT 0,
  created TEXT NOT NULL
);
