-- transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  original_text TEXT NOT NULL,
  translated_text TEXT,
  language_pair TEXT DEFAULT 'en-tl',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- meeting_summaries table
CREATE TABLE IF NOT EXISTS meeting_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  user_id TEXT PRIMARY KEY,
  api_key TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- scheduled_meetings table
CREATE TABLE IF NOT EXISTS scheduled_meetings (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- server_settings table
CREATE TABLE IF NOT EXISTS server_settings (
  id SERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Optional but recommended for Eburon)
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_settings ENABLE ROW LEVEL SECURITY;

-- Simple policies for development
CREATE POLICY "Allow all access" ON transcripts FOR ALL USING (true);
CREATE POLICY "Allow all access" ON meeting_summaries FOR ALL USING (true);
CREATE POLICY "Allow all access" ON api_keys FOR ALL USING (true);
CREATE POLICY "Allow all access" ON scheduled_meetings FOR ALL USING (true);
CREATE POLICY "Allow all access" ON server_settings FOR ALL USING (true);
