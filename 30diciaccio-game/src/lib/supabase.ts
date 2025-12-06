import { createClient } from '@supabase/supabase-js';

// Configurazione Supabase - sostituire con le proprie credenziali
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper per verificare se Supabase è configurato
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://your-project.supabase.co' && 
         supabaseAnonKey !== 'your-anon-key';
};

/* 
Schema SQL per Supabase - Eseguire nella console SQL:

-- Abilita RLS
ALTER DATABASE postgres SET timezone TO 'Europe/Rome';

-- Tabella Users
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname TEXT NOT NULL,
  avatar TEXT,
  passkey_id TEXT UNIQUE,
  squadra_id UUID REFERENCES squadre(id),
  punti_personali INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Squadre
CREATE TABLE squadre (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  emoji TEXT NOT NULL,
  punti_squadra INTEGER DEFAULT 0,
  colore TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Quest
CREATE TABLE quest (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  giorno INTEGER NOT NULL,
  titolo TEXT NOT NULL,
  descrizione TEXT,
  punti INTEGER NOT NULL,
  difficolta TEXT CHECK (difficolta IN ('facile', 'media', 'difficile', 'epica')),
  tipo_prova TEXT[] DEFAULT ARRAY['foto'],
  emoji TEXT DEFAULT '🎯',
  scadenza TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Prove Quest
CREATE TABLE prove_quest (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_id UUID REFERENCES quest(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('foto', 'video', 'testo')),
  contenuto TEXT NOT NULL,
  stato TEXT DEFAULT 'pending' CHECK (stato IN ('pending', 'in_verifica', 'validata', 'rifiutata')),
  voti_positivi INTEGER DEFAULT 0,
  voti_totali INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Gare
CREATE TABLE gare (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descrizione TEXT,
  squadra_a_id UUID REFERENCES squadre(id),
  squadra_b_id UUID REFERENCES squadre(id),
  vincitore_id UUID REFERENCES squadre(id),
  punti_in_palio INTEGER DEFAULT 50,
  orario TIMESTAMP WITH TIME ZONE,
  giorno INTEGER NOT NULL,
  stato TEXT DEFAULT 'programmata' CHECK (stato IN ('programmata', 'live', 'completata')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Voti
CREATE TABLE voti (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prova_id UUID REFERENCES prove_quest(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  valore BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prova_id, user_id)
);

-- Tabella Bonus Punti
CREATE TABLE bonus_punti (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id),
  punti INTEGER NOT NULL,
  motivo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Game State
CREATE TABLE game_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  giorno_corrente INTEGER DEFAULT 0,
  evento_iniziato BOOLEAN DEFAULT FALSE,
  data_inizio TIMESTAMP WITH TIME ZONE,
  data_fine TIMESTAMP WITH TIME ZONE
);

-- Tabella Notifiche
CREATE TABLE notifiche (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  titolo TEXT NOT NULL,
  messaggio TEXT NOT NULL,
  tipo TEXT DEFAULT 'sistema' CHECK (tipo IN ('quest', 'gara', 'bonus', 'sistema')),
  letta BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserisci squadre predefinite
INSERT INTO squadre (nome, emoji, colore) VALUES
  ('Tigri Pazze', '🐯', '#FF6B6B'),
  ('Pecore Volanti', '🐑', '#4ECDC4'),
  ('Matti del Bosco', '🌲', '#FFE66D'),
  ('Leoni Ruggenti', '🦁', '#FF9F43'),
  ('Aquile Veloci', '🦅', '#6C5CE7'),
  ('Lupi Notturni', '🐺', '#A29BFE');

-- Inserisci game state iniziale
INSERT INTO game_state (giorno_corrente, evento_iniziato) VALUES (0, FALSE);

-- Abilita RLS su tutte le tabelle
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE squadre ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest ENABLE ROW LEVEL SECURITY;
ALTER TABLE prove_quest ENABLE ROW LEVEL SECURITY;
ALTER TABLE gare ENABLE ROW LEVEL SECURITY;
ALTER TABLE voti ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_punti ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifiche ENABLE ROW LEVEL SECURITY;

-- Policies (semplificato per demo)
CREATE POLICY "Tutti possono leggere users" ON users FOR SELECT USING (true);
CREATE POLICY "Tutti possono leggere squadre" ON squadre FOR SELECT USING (true);
CREATE POLICY "Tutti possono leggere quest" ON quest FOR SELECT USING (true);
CREATE POLICY "Tutti possono leggere prove" ON prove_quest FOR SELECT USING (true);
CREATE POLICY "Tutti possono leggere gare" ON gare FOR SELECT USING (true);
CREATE POLICY "Tutti possono leggere game_state" ON game_state FOR SELECT USING (true);

*/
