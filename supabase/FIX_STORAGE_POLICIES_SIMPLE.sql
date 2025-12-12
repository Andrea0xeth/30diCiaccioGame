-- ============================================
-- FIX STORAGE POLICIES - VERSIONE SEMPLIFICATA
-- ============================================
-- Questa versione usa condizioni molto semplici per testare

-- Rimuovi tutte le policy esistenti
DROP POLICY IF EXISTS "Permetti upload avatar" ON storage.objects;
DROP POLICY IF EXISTS "Permetti upload prove" ON storage.objects;
DROP POLICY IF EXISTS "Permetti lettura file pubblici" ON storage.objects;
DROP POLICY IF EXISTS "Permetti update propri file" ON storage.objects;
DROP POLICY IF EXISTS "Permetti delete propri file" ON storage.objects;

-- ============================================
-- POLICY 1: UPLOAD AVATAR
-- ============================================
CREATE POLICY "Permetti upload avatar"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'prove-quest' AND
  name LIKE 'avatars/%'
);

-- ============================================
-- POLICY 2: UPLOAD PROVE QUEST - VERSIONE SEMPLIFICATA
-- ============================================
-- Permette agli utenti autenticati di caricare qualsiasi file
-- nel bucket prove-quest che NON inizia con 'avatars/'
-- Usa una condizione molto semplice
CREATE POLICY "Permetti upload prove"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'prove-quest' AND
  (name !~ '^avatars/')
);

-- ============================================
-- POLICY 3: LETTURA PUBBLICA
-- ============================================
CREATE POLICY "Permetti lettura file pubblici"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'prove-quest'
);

-- ============================================
-- POLICY 4: UPDATE PROPRI FILE
-- ============================================
CREATE POLICY "Permetti update propri file"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'prove-quest' AND
  (
    (name LIKE 'avatars/' || auth.uid()::text || '/%')
    OR
    (name LIKE auth.uid()::text || '/%')
  )
);

-- ============================================
-- POLICY 5: DELETE PROPRI FILE
-- ============================================
CREATE POLICY "Permetti delete propri file"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'prove-quest' AND
  (
    (name LIKE 'avatars/' || auth.uid()::text || '/%')
    OR
    (name LIKE auth.uid()::text || '/%')
  )
);

-- ============================================
-- VERIFICA LA DEFINIZIONE DELLA POLICY
-- ============================================
SELECT 
  policyname,
  cmd,
  roles,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname = 'Permetti upload prove';

-- ✅ Policy create!
-- Prova ora a caricare un file

