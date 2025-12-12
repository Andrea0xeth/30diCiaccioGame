-- ============================================
-- CREA FUNZIONE PER ESEGUIRE SQL DINAMICO
-- ============================================
-- Questa funzione permette di eseguire SQL dinamico tramite RPC
-- ⚠️ ATTENZIONE: Usa solo in sviluppo, rimuovi in produzione!

CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN 'OK';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'ERROR: ' || SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION exec_sql TO anon, authenticated;

-- Ora puoi chiamare: SELECT exec_sql('CREATE POLICY ...');

