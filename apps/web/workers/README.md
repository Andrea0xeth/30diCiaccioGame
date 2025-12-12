# 📱 Push Notification Worker

Worker Node.js per inviare notifiche push usando `web-push`.

## 🚀 Setup

### 1. Installa dipendenze

```bash
cd apps/web/workers
npm install
```

### 2. Configura variabili d'ambiente

Crea un file `.env`:

```env
SUPABASE_URL=https://smqoyszeqikjrhwgclrr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

### 3. Esegui il worker

```bash
npm start
```

## 📋 Come Funziona

1. L'Edge Function aggiunge le notifiche alla coda (`push_notifications_queue`)
2. Il worker legge le notifiche `pending` dalla coda
3. Per ogni notifica:
   - Recupera le subscription dell'utente
   - Invia le notifiche usando `web-push`
   - Aggiorna lo stato nella coda

## 🔄 Deploy

### Opzione 1: Vercel Cron Job

Crea `vercel.json` nella root:

```json
{
  "crons": [{
    "path": "/api/cron/push-notifications",
    "schedule": "*/5 * * * *"
  }]
}
```

Crea `apps/web/api/cron/push-notifications.js`:

```javascript
const { processQueue } = require('../../workers/push-notification-worker');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verifica secret (opzionale ma consigliato)
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await processQueue();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Cron error:', error);
    res.status(500).json({ error: error.message });
  }
}
```

### Opzione 2: Railway

1. Crea un nuovo progetto su Railway
2. Collega il repository
3. Imposta le variabili d'ambiente
4. Configura il comando: `cd apps/web/workers && npm start`
5. Aggiungi un cron job per eseguire ogni 5 minuti

### Opzione 3: GitHub Actions

Crea `.github/workflows/push-notifications.yml`:

```yaml
name: Push Notifications Worker

on:
  schedule:
    - cron: '*/5 * * * *'  # Ogni 5 minuti
  workflow_dispatch:

jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd apps/web/workers && npm install
      - run: cd apps/web/workers && npm start
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          VAPID_PUBLIC_KEY: ${{ secrets.VAPID_PUBLIC_KEY }}
          VAPID_PRIVATE_KEY: ${{ secrets.VAPID_PRIVATE_KEY }}
```

## ✅ Verifica

Dopo il deploy, verifica che funzioni:

1. Invia una notifica dal pannello admin
2. Controlla la tabella `push_notifications_queue` nel database
3. Attendi che il worker processi la notifica
4. Verifica che lo status diventi `sent`

