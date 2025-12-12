-- ============================================
-- DEBUG STORAGE POLICY - Verifica configurazione
-- ============================================
-- Esegui questo script per verificare la configurazione
-- e capire perché le policy potrebbero non funzionare

-- 1. Verifica che il bucket esista e sia pubblico
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'prove-quest';

-- 2. Verifica che RLS sia abilitato sulla tabella storage.objects
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

-- 3. Mostra tutte le policy esistenti per storage.objects
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;

-- 4. Test della funzione foldername con un path di esempio
-- Sostituisci con un path reale se vuoi testare
SELECT 
  'a5411530-1b4c-416b-bfe1-bdb8e4cd417a/70ea5daf-d2a7-43c3-baf2-06039dcf52c7/file.mov' as test_path,
  storage.foldername('a5411530-1b4c-416b-bfe1-bdb8e4cd417a/70ea5daf-d2a7-43c3-baf2-06039dcf52c7/file.mov') as folders,
  (storage.foldername('a5411530-1b4c-416b-bfe1-bdb8e4cd417a/70ea5daf-d2a7-43c3-baf2-06039dcf52c7/file.mov'))[1] as first_folder;

-- 5. Verifica se l'utente corrente è autenticato
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- 6. Test della condizione della policy
-- Sostituisci con il tuo user_id reale
SELECT 
  'a5411530-1b4c-416b-bfe1-bdb8e4cd417a/70ea5daf-d2a7-43c3-baf2-06039dcf52c7/file.mov' as test_path,
  'prove-quest' = 'prove-quest' as bucket_check,
  (storage.foldername('a5411530-1b4c-416b-bfe1-bdb8e4cd417a/70ea5daf-d2a7-43c3-baf2-06039dcf52c7/file.mov'))[1] != 'avatars' as folder_check,
  'a5411530-1b4c-416b-bfe1-bdb8e4cd417a/70ea5daf-d2a7-43c3-baf2-06039dcf52c7/file.mov' NOT LIKE 'avatars/%' as like_check;

