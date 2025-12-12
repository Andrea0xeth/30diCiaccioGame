#!/usr/bin/env node

/**
 * Script per applicare le policy RLS per bonus_punti via Supabase REST API
 * Esegui: node apps/web/scripts/apply-bonus-policies-via-api.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

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
  supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili d\'ambiente mancanti');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyPolicies() {
  try {
    console.log('📝 Applicazione policy RLS per bonus_punti...\n');

    // Leggi lo script SQL
    const sqlFile = join(__dirname, '../../../supabase/FIX_BONUS_PUNTI_RLS_POLICIES.sql');
    const sqlScript = readFileSync(sqlFile, 'utf-8');

    // Dividi in query separate (rimuovi commenti e query SELECT di verifica)
    const queries = sqlScript
      .split(';')
      .map(q => q.trim())
      .filter(q => {
        const upper = q.toUpperCase();
        return q.length > 0 && 
               !q.startsWith('--') && 
               !upper.includes('SELECT') || 
               !upper.includes('PG_POLICIES');
      });

    console.log(`   Eseguendo ${queries.length} query...\n`);

    // Esegui ogni query tramite RPC exec_sql
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (!query || query.length < 10) continue; // Salta query troppo corte
      
      console.log(`   [${i + 1}/${queries.length}] Eseguendo query...`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: query + ';'
      });

      if (error) {
        console.error(`   ❌ Errore: ${error.message}`);
        console.log('\n📋 Esegui manualmente questo SQL nel Supabase SQL Editor:\n');
        console.log(readFileSync(sqlFile, 'utf-8'));
        return;
      }

      console.log(`   ✅ Query ${i + 1} eseguita`);
    }

    console.log('\n✅ Tutte le policy sono state applicate con successo!\n');

  } catch (error) {
    console.error('❌ Errore:', error.message);
    console.log('\n📋 Esegui manualmente questo SQL nel Supabase SQL Editor:\n');
    const sqlFile = join(__dirname, '../../../supabase/FIX_BONUS_PUNTI_RLS_POLICIES.sql');
    console.log(readFileSync(sqlFile, 'utf-8'));
  }
}

applyPolicies();

