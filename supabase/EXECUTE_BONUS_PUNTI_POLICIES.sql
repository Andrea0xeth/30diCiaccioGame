-- ============================================
-- ESEGUI QUESTO SCRIPT NEL SUPABASE SQL EDITOR
-- ============================================
-- Questo script applica le policy RLS per bonus_punti
-- Copia e incolla tutto il contenuto nel Supabase SQL Editor

-- ============================================
-- POLICY PER INSERT (Assegnare bonus punti)
-- ============================================
DROP POLICY IF EXISTS "Insert bonus punti anon" ON bonus_punti;
CREATE POLICY "Insert bonus punti anon" 
ON bonus_punti FOR INSERT 
WITH CHECK (true);

-- ============================================
-- POLICY PER SELECT (Leggere bonus punti)
-- ============================================
DROP POLICY IF EXISTS "Lettura pubblica bonus punti" ON bonus_punti;
CREATE POLICY "Lettura pubblica bonus punti" 
ON bonus_punti FOR SELECT 
USING (true);

-- ============================================
-- VERIFICA
-- ============================================
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'bonus_punti'
ORDER BY policyname;

-- ✅ Fatto! Ora gli admin possono assegnare punti bonus

