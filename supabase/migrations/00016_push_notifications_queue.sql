-- ============================================
-- PUSH NOTIFICATIONS QUEUE
-- ============================================
-- Tabella coda per le notifiche push da inviare
-- Il worker Node.js leggerà da questa tabella e invierà le notifiche

CREATE TABLE IF NOT EXISTS push_notifications_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT DEFAULT '/pwa-192x192.png',
  badge TEXT DEFAULT '/pwa-192x192.png',
  url TEXT DEFAULT '/',
  data JSONB DEFAULT '{}'::JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_push_queue_status ON push_notifications_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_push_queue_user ON push_notifications_queue(user_id);

-- RLS (permette al worker di leggere/scrivere)
ALTER TABLE push_notifications_queue ENABLE ROW LEVEL SECURITY;

-- Policies permettono tutto (il worker userà service role key)
DROP POLICY IF EXISTS "Allow all for service role" ON push_notifications_queue;
CREATE POLICY "Allow all for service role" ON push_notifications_queue FOR ALL USING (true) WITH CHECK (true);

