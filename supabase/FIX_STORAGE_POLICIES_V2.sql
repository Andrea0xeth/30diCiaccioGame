-- ============================================
-- FIX STORAGE POLICIES V2 - Versione alternativa
-- ============================================
-- Se la versione precedente non funziona, prova questa
-- che usa condizioni più semplici e dirette

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
-- POLICY 2: UPLOAD PROVE QUEST (VERSIONE ALTERNATIVA)
-- ============================================
-- Usa una condizione più semplice: permette tutto nel bucket
-- tranne la cartella avatars
CREATE POLICY "Permetti upload prove"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'prove-quest' AND
  name NOT LIKE 'avatars/%'
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
-- VERIFICA
-- ============================================
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE 'Permetti%'
ORDER BY policyname;

-- ✅ Policy create con condizioni semplificate!
-- Ora prova a caricare un file

