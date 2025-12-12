-- ============================================
-- APPLICA POLICY CORRETTE PER STORAGE
-- ============================================
-- NOTA: Non possiamo modificare direttamente storage.objects
-- Le policy vengono create tramite SQL, ma RLS è già abilitato di default
-- 
-- Questo script:
-- 1. Rimuove le policy esistenti
-- 2. Crea nuove policy con condizioni semplificate usando LIKE

-- STEP 1: Rimuovi tutte le policy esistenti
DROP POLICY IF EXISTS "Permetti upload avatar" ON storage.objects;
DROP POLICY IF EXISTS "Permetti upload prove" ON storage.objects;
DROP POLICY IF EXISTS "Permetti lettura file pubblici" ON storage.objects;
DROP POLICY IF EXISTS "Permetti update propri file" ON storage.objects;
DROP POLICY IF EXISTS "Permetti delete propri file" ON storage.objects;

-- STEP 2: Crea policy per UPLOAD AVATAR
CREATE POLICY "Permetti upload avatar"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'prove-quest' AND
  name LIKE 'avatars/%'
);

-- STEP 3: Crea policy per UPLOAD PROVE QUEST
-- Usa NOT LIKE invece di foldername per maggiore compatibilità
CREATE POLICY "Permetti upload prove"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'prove-quest' AND
  name NOT LIKE 'avatars/%'
);

-- STEP 4: Crea policy per LETTURA PUBBLICA
CREATE POLICY "Permetti lettura file pubblici"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'prove-quest'
);

-- STEP 5: Crea policy per UPDATE PROPRI FILE
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

-- STEP 6: Crea policy per DELETE PROPRI FILE
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

-- STEP 7: Verifica le policy create
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE 'Permetti%'
ORDER BY policyname;

-- ✅ Completato!
-- Ora prova a caricare un file

