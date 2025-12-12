#!/usr/bin/env node

/**
 * Script per applicare le policy RLS per bonus_punti
 * Esegui: node apps/web/scripts/apply-bonus-punti-policies.js
 * 
 * Oppure:
 *   pnpm --filter @30diciaccio/web apply:bonus-policies
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leggi le variabili d'ambiente
let supabaseUrl = '';
let supabaseServiceKey = '';

try {
  const envPath = join(__dirname, '..', '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  
  const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
  const keyMatch = envContent.match(/VITE_SUPABASE_SERVICE_ROLE_KEY=(.+)/) || 
                   envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
  
  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (keyMatch) supabaseServiceKey = keyMatch[1].trim();
} catch (error) {
  // Se non trova .env.local, prova dalle variabili d'ambiente
  supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Errore: Variabili d\'ambiente mancanti');
  console.error('   Assicurati di avere configurato in .env.local:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - VITE_SUPABASE_SERVICE_ROLE_KEY o SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n   Puoi creare/modificare il file apps/web/.env.local con:');
  console.error('   VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('   VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
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
const sqlFile = join(__dirname, '../../../supabase/FIX_BONUS_PUNTI_RLS_POLICIES.sql');
let sqlScript;

try {
  sqlScript = readFileSync(sqlFile, 'utf-8');
} catch (error) {
  console.error(`❌ Errore lettura file SQL: ${error.message}`);
  console.error(`   File cercato: ${sqlFile}`);
  process.exit(1);
}

async function applyBonusPolicies() {
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

    console.log('📝 Applicazione policy RLS per bonus_punti...');
    console.log('   Questo potrebbe richiedere alcuni secondi...\n');

    // Esegui lo script SQL
    await client.query(sqlScript);

    console.log('✅ Policy bonus_punti applicate con successo!\n');

    // Verifica le policy create
    console.log('🔍 Verifica policy create...\n');
    const result = await client.query(`
      SELECT 
        policyname,
        permissive,
        roles,
        cmd
      FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename = 'bonus_punti'
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
    console.log('\n💡 Ora gli admin possono assegnare punti bonus agli utenti dalla pagina Admin.\n');

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
applyBonusPolicies().catch((error) => {
  console.error('❌ Errore fatale:', error);
  process.exit(1);
});

