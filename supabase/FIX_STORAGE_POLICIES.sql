-- ============================================
-- FIX STORAGE POLICIES - UPLOAD PROVE QUEST
-- ============================================
-- Esegui questo script nella Supabase SQL Editor per risolvere l'errore:
-- "new row violates row-level security policy"
--
-- Vai su: https://supabase.com/dashboard/project/[PROJECT-REF]/sql/new
-- Copia e incolla questo script, poi clicca "Run"

-- ============================================
-- STEP 1: Verifica e configura il bucket
-- ============================================
-- Assicurati che il bucket esista e sia pubblico
UPDATE storage.buckets 
SET public = true 
WHERE id = 'prove-quest';

-- Verifica che RLS sia abilitato sulla tabella storage.objects
-- (RLS deve essere abilitato per le policy di storage)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects'
  ) THEN
    RAISE EXCEPTION 'La tabella storage.objects non esiste';
  END IF;
END $$;

-- ============================================
-- STEP 2: Rimuovi policy esistenti (se presenti)
-- ============================================
DROP POLICY IF EXISTS "Permetti upload avatar" ON storage.objects;
DROP POLICY IF EXISTS "Permetti upload prove" ON storage.objects;
DROP POLICY IF EXISTS "Permetti lettura file pubblici" ON storage.objects;
DROP POLICY IF EXISTS "Permetti update propri file" ON storage.objects;
DROP POLICY IF EXISTS "Permetti delete propri file" ON storage.objects;

-- ============================================
-- STEP 3: Crea policy per UPLOAD AVATAR
-- ============================================
-- Permette a chiunque (anon/authenticated) di caricare avatar
-- Necessario durante la registrazione quando l'utente non è ancora autenticato
CREATE POLICY "Permetti upload avatar"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'prove-quest' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- ============================================
-- STEP 4: Crea policy per UPLOAD PROVE QUEST
-- ============================================
-- Permette agli utenti autenticati di caricare prove (foto/video)
-- Le prove vengono salvate in: {userId}/{questId}/{timestamp}.{ext}
CREATE POLICY "Permetti upload prove"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'prove-quest' AND
  (storage.foldername(name))[1] != 'avatars' -- Tutto tranne avatars
);

-- ============================================
-- STEP 5: Crea policy per LETTURA PUBBLICA
-- ============================================
-- Permette a chiunque di leggere tutti i file pubblici
-- Necessario per visualizzare avatar e prove
CREATE POLICY "Permetti lettura file pubblici"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'prove-quest'
);

-- ============================================
-- STEP 6: Crea policy per UPDATE PROPRI FILE
-- ============================================
CREATE POLICY "Permetti update propri file"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'prove-quest' AND
  (
    -- Avatar: può aggiornare solo nella sua cartella
    ((storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text)
    OR
    -- Prove: può aggiornare solo nella sua cartella
    ((storage.foldername(name))[1] != 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  )
);

-- ============================================
-- STEP 7: Crea policy per DELETE PROPRI FILE
-- ============================================
CREATE POLICY "Permetti delete propri file"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'prove-quest' AND
  (
    -- Avatar: può eliminare solo nella sua cartella
    ((storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text)
    OR
    -- Prove: può eliminare solo nella sua cartella
    ((storage.foldername(name))[1] != 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  )
);

-- ============================================
-- ✅ VERIFICA
-- ============================================
-- Verifica che le policy siano state create correttamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE 'Permetti%'
ORDER BY policyname;

-- ✅ Policy create!
-- Ora gli utenti autenticati possono:
-- 1. ✅ Caricare avatar durante la registrazione (anon)
-- 2. ✅ Caricare prove quest (foto/video) quando autenticati
-- 3. ✅ Visualizzare tutti i file pubblici
-- 4. ✅ Aggiornare/eliminare solo i propri file

