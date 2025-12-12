-- ============================================
-- AGGIORNA SISTEMA QUEST: 10 QUEST AL GIORNO
-- ============================================
-- Questo script:
-- 1. Modifica assign_daily_quests per assegnare 10 quest invece di 3
-- 2. Aggiunge logica per scadenza giornaliera (mezzanotte a mezzanotte)
-- 3. Le quest scadono dopo 24h dalla mezzanotte e vengono rigenerate

-- ============================================
-- FUNZIONE AGGIORNATA: ASSEGNA 10 QUEST AL GIORNO
-- ============================================
-- Elimina la funzione esistente per cambiare il tipo di ritorno
DROP FUNCTION IF EXISTS assign_daily_quests(uuid, integer);

CREATE OR REPLACE FUNCTION assign_daily_quests(
  p_user_id UUID,
  p_giorno INTEGER
)
RETURNS TABLE (
  quest_id UUID,
  titolo TEXT,
  descrizione TEXT,
  punti INTEGER,
  difficolta TEXT,
  tipo_prova TEXT[],
  emoji TEXT,
  scadenza TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_assigned_count INTEGER;
  v_today_start TIMESTAMP WITH TIME ZONE;
  v_today_end TIMESTAMP WITH TIME ZONE;
  v_assigned_date DATE;
BEGIN
  -- Calcola inizio e fine del giorno corrente (mezzanotte a mezzanotte, timezone Italia)
  v_today_start := date_trunc('day', (NOW() AT TIME ZONE 'Europe/Rome')) AT TIME ZONE 'Europe/Rome';
  v_today_end := v_today_start + INTERVAL '1 day';
  
  -- Verifica se l'utente ha già le quest assegnate per questo giorno
  -- E se sono state assegnate oggi (non scadute)
  SELECT COUNT(*), MAX(assigned_at::date) INTO v_assigned_count, v_assigned_date
  FROM user_quest_assignments
  WHERE user_id = p_user_id 
    AND giorno = p_giorno
    AND assigned_at >= v_today_start
    AND assigned_at < v_today_end;

  -- Se ha già 10 quest assegnate oggi, restituisci quelle esistenti
  IF v_assigned_count >= 10 THEN
    RETURN QUERY
    SELECT 
      q.id,
      q.titolo,
      q.descrizione,
      q.punti,
      q.difficolta,
      q.tipo_prova,
      q.emoji,
      v_today_end as scadenza -- Scade a mezzanotte
    FROM quest q
    INNER JOIN user_quest_assignments uqa ON q.id = uqa.quest_id
    WHERE uqa.user_id = p_user_id 
      AND uqa.giorno = p_giorno
      AND uqa.assigned_at >= v_today_start
      AND uqa.assigned_at < v_today_end
      AND q.attiva = true
    ORDER BY uqa.assigned_at;
    RETURN;
  END IF;

  -- Rimuovi le quest scadute (assegnate prima di oggi)
  DELETE FROM user_quest_assignments
  WHERE user_id = p_user_id 
    AND giorno = p_giorno
    AND assigned_at < v_today_start;

  -- Assegna 10 quest usando un hash deterministico basato sull'ID utente e sul giorno
  -- Questo garantisce che ogni utente riceva quest diverse ma deterministiche
  INSERT INTO user_quest_assignments (user_id, quest_id, giorno, assigned_at)
  SELECT 
    p_user_id,
    q.id,
    p_giorno,
    NOW() -- Assegna con timestamp corrente
  FROM quest q
  WHERE q.attiva = true
    AND q.id NOT IN (
      -- Escludi quest già assegnate oggi
      SELECT uqa2.quest_id 
      FROM user_quest_assignments uqa2
      WHERE uqa2.user_id = p_user_id 
        AND uqa2.giorno = p_giorno
        AND uqa2.assigned_at >= v_today_start
        AND uqa2.assigned_at < v_today_end
    )
  ORDER BY md5(q.id::text || p_user_id::text || p_giorno::text || v_today_start::text)
  LIMIT 10;

  -- Restituisci le quest assegnate con scadenza a mezzanotte
  RETURN QUERY
  SELECT 
    q.id,
    q.titolo,
    q.descrizione,
    q.punti,
    q.difficolta,
    q.tipo_prova,
    q.emoji,
    v_today_end as scadenza -- Scade a mezzanotte del giorno successivo
  FROM quest q
  INNER JOIN user_quest_assignments uqa ON q.id = uqa.quest_id
  WHERE uqa.user_id = p_user_id 
    AND uqa.giorno = p_giorno
    AND uqa.assigned_at >= v_today_start
    AND uqa.assigned_at < v_today_end
    AND q.attiva = true
  ORDER BY uqa.assigned_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION assign_daily_quests TO anon, authenticated;

-- ============================================
-- FUNZIONE AGGIORNATA: GET_USER_QUESTS
-- ============================================
-- Restituisce solo le quest assegnate oggi (non scadute)
-- Elimina la funzione esistente per cambiare il tipo di ritorno
DROP FUNCTION IF EXISTS get_user_quests(uuid, integer);

CREATE OR REPLACE FUNCTION get_user_quests(
  p_user_id UUID,
  p_giorno INTEGER
)
RETURNS TABLE (
  quest_id UUID,
  titolo TEXT,
  descrizione TEXT,
  punti INTEGER,
  difficolta TEXT,
  tipo_prova TEXT[],
  emoji TEXT,
  scadenza TIMESTAMP WITH TIME ZONE,
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN
) AS $$
DECLARE
  v_today_start TIMESTAMP WITH TIME ZONE;
  v_today_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calcola inizio e fine del giorno corrente (mezzanotte a mezzanotte, timezone Italia)
  v_today_start := date_trunc('day', (NOW() AT TIME ZONE 'Europe/Rome')) AT TIME ZONE 'Europe/Rome';
  v_today_end := v_today_start + INTERVAL '1 day';
  
  RETURN QUERY
  SELECT 
    q.id,
    q.titolo,
    q.descrizione,
    q.punti,
    q.difficolta,
    q.tipo_prova,
    q.emoji,
    v_today_end as scadenza, -- Scade a mezzanotte
    uqa.assigned_at,
    (uqa.completed_at IS NOT NULL) as completed
  FROM user_quest_assignments uqa
  INNER JOIN quest q ON uqa.quest_id = q.id
  WHERE uqa.user_id = p_user_id 
    AND uqa.giorno = p_giorno
    AND uqa.assigned_at >= v_today_start
    AND uqa.assigned_at < v_today_end
    AND q.attiva = true
  ORDER BY uqa.assigned_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_quests TO anon, authenticated;

-- ============================================
-- VERIFICA
-- ============================================
-- Test: verifica che le funzioni siano state aggiornate
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc
WHERE proname IN ('assign_daily_quests', 'get_user_quests')
ORDER BY proname;

-- ✅ Funzioni aggiornate!
-- Ora:
-- 1. ✅ Ogni utente riceve 10 quest al giorno
-- 2. ✅ Le quest scadono a mezzanotte e vengono rigenerate
-- 3. ✅ Le quest assegnate oggi sono valide fino a mezzanotte

