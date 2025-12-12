# 🚀 Deploy Edge Function - Fix CORS

Ho corretto la gestione CORS nell'Edge Function. Ora devi fare il deploy.

## 📋 Deploy

### Opzione 1: Via Dashboard (Più Semplice)

1. Vai su **Supabase Dashboard** → **Edge Functions**
2. Clicca su **`send-push-notification`** (o creala se non esiste)
3. **Copia tutto il contenuto** del file:
   ```
   supabase/functions/send-push-notification/index.ts
   ```
4. **Incolla** nell'editor del dashboard
5. Clicca **"Deploy"** o **"Save & Deploy"**

### Opzione 2: Via CLI

```bash
# 1. Assicurati di essere loggato
npx supabase login

# 2. Link al progetto (se non già fatto)
npx supabase link --project-ref smqoyszeqikjrhwgclrr

# 3. Deploy
npx supabase functions deploy send-push-notification
```

## ✅ Cosa ho corretto

- ✅ Aggiunto header CORS a tutte le risposte
- ✅ Migliorato la gestione della preflight request (OPTIONS)
- ✅ Aggiunto `Access-Control-Max-Age` per cache delle preflight
- ✅ Tutte le risposte ora includono gli header CORS corretti

## 🔍 Verifica

Dopo il deploy, prova a inviare una notifica dal pannello admin. Dovrebbe funzionare senza errori CORS.

