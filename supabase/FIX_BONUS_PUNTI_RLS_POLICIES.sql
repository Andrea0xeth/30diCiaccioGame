-- ============================================
-- FIX RLS POLICIES PER TABELLA BONUS_PUNTI
-- ============================================
-- Questo script aggiunge le policy RLS mancanti per permettere agli admin
-- di assegnare punti bonus agli utenti

-- ============================================
-- POLICY PER INSERT (Assegnare bonus punti)
-- ============================================
-- Permette agli admin di inserire nuovi bonus punti
DROP POLICY IF EXISTS "Insert bonus punti anon" ON bonus_punti;
CREATE POLICY "Insert bonus punti anon" 
ON bonus_punti FOR INSERT 
WITH CHECK (true);

-- ============================================
-- POLICY PER SELECT (Leggere bonus punti)
-- ============================================
-- Permette a tutti di leggere i bonus punti (per trasparenza)
DROP POLICY IF EXISTS "Lettura pubblica bonus punti" ON bonus_punti;
CREATE POLICY "Lettura pubblica bonus punti" 
ON bonus_punti FOR SELECT 
USING (true);

-- ============================================
-- VERIFICA
-- ============================================
-- Mostra tutte le policy esistenti per la tabella bonus_punti
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'bonus_punti'
ORDER BY policyname;

-- ✅ Policy aggiornate!
-- Ora gli admin possono:
-- - Inserire nuovi bonus punti (INSERT)
-- - Leggere tutti i bonus punti (SELECT)
-- - La funzione aggiungiBonus nel frontend dovrebbe funzionare correttamente

