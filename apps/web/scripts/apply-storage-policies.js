#!/usr/bin/env node

/**
 * Script per applicare le policy RLS al bucket storage prove-quest
 * 
 * Questo script risolve l'errore:
 * "new row violates row-level security policy"
 * 
 * Uso:
 *   node scripts/apply-storage-policies.js
 * 
 * Oppure:
 *   pnpm --filter @30diciaccio/web apply:storage-policies
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leggi le variabili d'ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Errore: Variabili d\'ambiente mancanti');
  console.error('   Assicurati di avere configurato:');
  console.error('   - VITE_SUPABASE_URL o SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n   Puoi creare un file .env.local con:');
  console.error('   VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

// Estrai la connection string dal URL
const url = new URL(supabaseUrl);
const dbHost = url.hostname;
const dbPort = url.port || '5432';
const dbName = url.pathname.split('/').pop() || 'postgres';
const dbUser = 'postgres';
const dbPassword = supabaseServiceKey;

// Leggi lo script SQL
const sqlFile = join(__dirname, '../../supabase/FIX_STORAGE_POLICIES.sql');
let sqlScript;

try {
  sqlScript = readFileSync(sqlFile, 'utf-8');
} catch (error) {
  console.error(`❌ Errore lettura file SQL: ${error.message}`);
  console.error(`   File cercato: ${sqlFile}`);
  process.exit(1);
}

async function applyStoragePolicies() {
  const client = new Client({
    host: dbHost,
    port: parseInt(dbPort),
    database: dbName,
    user: dbUser,
    password: dbPassword,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connessione al database Supabase...');
    await client.connect();
    console.log('✅ Connesso!\n');

    console.log('📝 Applicazione policy storage...');
    console.log('   Questo potrebbe richiedere alcuni secondi...\n');

    // Esegui lo script SQL
    await client.query(sqlScript);

    console.log('✅ Policy storage applicate con successo!\n');

    // Verifica le policy create
    console.log('🔍 Verifica policy create...\n');
    const result = await client.query(`
      SELECT 
        policyname,
        permissive,
        roles,
        cmd
      FROM pg_policies 
      WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND policyname LIKE 'Permetti%'
      ORDER BY policyname;
    `);

    if (result.rows.length > 0) {
      console.log('📋 Policy trovate:');
      result.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.policyname}`);
        console.log(`      - Operazione: ${row.cmd}`);
        console.log(`      - Ruoli: ${row.roles.join(', ')}`);
        console.log(`      - Permissiva: ${row.permissive}\n`);
      });
    } else {
      console.log('⚠️  Nessuna policy trovata. Potrebbe essere necessario verificare manualmente.\n');
    }

    console.log('✅ Completato!');
    console.log('\n💡 Ora puoi provare a caricare una foto o un video per una quest.');
    console.log('   L\'errore "new row violates row-level security policy" dovrebbe essere risolto.\n');

  } catch (error) {
    console.error('❌ Errore durante l\'applicazione delle policy:');
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes('permission denied')) {
      console.error('💡 Suggerimento:');
      console.error('   Assicurati di usare la SUPABASE_SERVICE_ROLE_KEY (non la anon key)');
      console.error('   La service role key ha i permessi necessari per creare policy.\n');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Esegui lo script
applyStoragePolicies().catch((error) => {
  console.error('❌ Errore fatale:', error);
  process.exit(1);
});

