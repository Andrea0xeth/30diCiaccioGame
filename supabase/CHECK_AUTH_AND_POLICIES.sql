-- ============================================
-- CHECK AUTHENTICATION AND POLICIES
-- ============================================
-- Script per verificare lo stato dell'autenticazione e delle policy

-- 1. Verifica lo stato RLS sulla tabella storage.objects
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

-- 2. Mostra tutte le policy per storage.objects con dettagli completi
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;

-- 3. Verifica se ci sono policy duplicate o in conflitto
SELECT 
  policyname,
  COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
GROUP BY policyname
HAVING COUNT(*) > 1;

-- 4. Test: verifica se un utente autenticato può inserire
-- (Questo richiede di essere eseguito come utente autenticato)
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'Authenticated'
    ELSE 'Not authenticated'
  END as auth_status;

-- 5. Verifica la configurazione del bucket
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'prove-quest';

