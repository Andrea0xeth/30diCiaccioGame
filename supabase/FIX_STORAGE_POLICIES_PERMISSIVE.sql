-- ============================================
-- FIX STORAGE POLICIES - VERSIONE PERMISSIVA (SOLO PER TEST)
-- ============================================
-- ATTENZIONE: Questa è una versione molto permissiva solo per testare
-- Se funziona, poi possiamo restringere le policy

-- Rimuovi tutte le policy esistenti
DROP POLICY IF EXISTS "Permetti upload avatar" ON storage.objects;
DROP POLICY IF EXISTS "Permetti upload prove" ON storage.objects;
DROP POLICY IF EXISTS "Permetti lettura file pubblici" ON storage.objects;
DROP POLICY IF EXISTS "Permetti update propri file" ON storage.objects;
DROP POLICY IF EXISTS "Permetti delete propri file" ON storage.objects;

-- ============================================
-- POLICY 1: UPLOAD - VERSIONE PERMISSIVA
-- ============================================
-- Permette agli utenti autenticati di caricare QUALSIASI file
-- nel bucket prove-quest (senza condizioni sul path)
-- SOLO PER TEST - da restringere dopo
CREATE POLICY "Permetti upload prove"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'prove-quest'
);

-- ============================================
-- POLICY 2: LETTURA PUBBLICA
-- ============================================
CREATE POLICY "Permetti lettura file pubblici"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'prove-quest'
);

-- ============================================
-- VERIFICA
-- ============================================
SELECT 
  policyname,
  cmd,
  roles,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE 'Permetti%'
ORDER BY policyname;

-- ✅ Policy permissiva creata!
-- Prova ora a caricare un file
-- Se funziona, significa che il problema era nella condizione
-- Poi possiamo restringere la policy

