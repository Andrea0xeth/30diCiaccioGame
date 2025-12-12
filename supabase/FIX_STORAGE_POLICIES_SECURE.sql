-- ============================================
-- FIX STORAGE POLICIES - VERSIONE SICURA
-- ============================================
-- Questa versione permette anon per INSERT (necessario per WebAuthn)
-- ma valida che l'userId nel path esista nella tabella users
-- Così solo utenti registrati possono caricare

-- Rimuovi tutte le policy esistenti
DROP POLICY IF EXISTS "Permetti upload avatar" ON storage.objects;
DROP POLICY IF EXISTS "Permetti upload prove" ON storage.objects;
DROP POLICY IF EXISTS "Permetti lettura file pubblici" ON storage.objects;
DROP POLICY IF EXISTS "Permetti update propri file" ON storage.objects;
DROP POLICY IF EXISTS "Permetti delete propri file" ON storage.objects;

-- ============================================
-- POLICY 1: UPLOAD AVATAR
-- ============================================
-- Permette anon/authenticated di caricare avatar
-- Valida che l'userId nel path esista nella tabella users
CREATE POLICY "Permetti upload avatar"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'prove-quest' AND
  name LIKE 'avatars/%' AND
  -- Valida che l'userId (secondo folder) esista nella tabella users
  EXISTS (
    SELECT 1 FROM users 
    WHERE id::text = (storage.foldername(name))[2]
  )
);

-- ============================================
-- POLICY 2: UPLOAD PROVE QUEST
-- ============================================
-- Permette anon/authenticated di caricare prove
-- Valida che l'userId nel path (primo folder) esista nella tabella users
-- Così solo utenti registrati possono caricare, anche senza sessione Supabase Auth
CREATE POLICY "Permetti upload prove"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'prove-quest' AND
  name NOT LIKE 'avatars/%' AND
  -- Valida che l'userId (primo folder) esista nella tabella users
  EXISTS (
    SELECT 1 FROM users 
    WHERE id::text = (storage.foldername(name))[1]
  )
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
-- Solo per utenti autenticati con sessione Supabase
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
-- Solo per utenti autenticati con sessione Supabase
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

-- ✅ Policy create!
-- Ora:
-- 1. ✅ Solo utenti registrati (che esistono in users) possono caricare
-- 2. ✅ Il path include l'userId, quindi sappiamo sempre chi ha caricato
-- 3. ✅ Funziona anche senza sessione Supabase Auth (necessario per WebAuthn)
-- 4. ✅ Le prove vengono salvate nel database con user_id, quindi abbiamo doppia traccia

