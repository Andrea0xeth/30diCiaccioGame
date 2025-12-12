-- ============================================
-- FUNZIONE RIMOSSA - NON PIÙ NECESSARIA
-- ============================================
-- Questa funzione non è più necessaria perché:
-- 1. Usiamo WebAuthn invece di Supabase Auth
-- 2. Le policy di storage permettono anon ma validano che l'userId esista in users
-- 3. Non serve creare una sessione Supabase Auth per l'upload dei file
--
-- Se in futuro servirà, può essere ripristinata da git history

-- DROP FUNCTION IF EXISTS create_auth_token_for_user(UUID);

