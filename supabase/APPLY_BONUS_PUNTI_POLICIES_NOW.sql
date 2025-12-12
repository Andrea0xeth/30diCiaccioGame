-- ============================================
-- APPLICA POLICY RLS PER BONUS_PUNTI
-- ============================================
-- Esegui questo script nel Supabase SQL Editor
-- Copia e incolla tutto il contenuto

-- Policy INSERT
DROP POLICY IF EXISTS "Insert bonus punti anon" ON bonus_punti;
CREATE POLICY "Insert bonus punti anon" 
ON bonus_punti FOR INSERT 
WITH CHECK (true);

-- Policy SELECT
DROP POLICY IF EXISTS "Lettura pubblica bonus punti" ON bonus_punti;
CREATE POLICY "Lettura pubblica bonus punti" 
ON bonus_punti FOR SELECT 
USING (true);

-- Verifica
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'bonus_punti'
ORDER BY policyname;

-- ✅ Fatto!

