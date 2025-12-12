# 🔑 Configura REST API Key di OneSignal su Vercel

## ⚠️ Errore Attuale

L'errore `OneSignal REST API Key non configurata` indica che la variabile d'ambiente non è configurata su Vercel.

## 📋 Passi per Configurare

### 1. Ottieni la REST API Key da OneSignal

1. Vai su **OneSignal Dashboard** → **Settings** → **Keys & IDs**
2. Trova la sezione **"REST API Key"**
3. Clicca su **"Show"** o **"Reveal"** per vedere la chiave
4. **Copia la chiave** (è una stringa lunga tipo: `YjA2Nz...`)

### 2. Configura su Vercel

1. Vai su **Vercel Dashboard** → **Il tuo progetto** → **Settings**
2. Vai su **Environment Variables**
3. Clicca su **"Add New"**
4. Compila:
   - **Key**: `ONESIGNAL_REST_API_KEY`
   - **Value**: (incolla la tua REST API Key)
   - **Environment**: Seleziona tutte:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
5. Clicca **Save**

### 3. Riavvia il Deploy

Dopo aver aggiunto la variabile:
1. Vai su **Deployments**
2. Clicca sui **3 puntini** sull'ultimo deploy
3. Clicca **Redeploy**

Oppure fai un nuovo commit per triggerare un nuovo deploy.

## ✅ Verifica

Dopo il redeploy, prova di nuovo a inviare una notifica dal pannello admin. Dovrebbe funzionare!

## 🔍 Dove Trovare la REST API Key

- **OneSignal Dashboard** → **Settings** (icona ingranaggio in alto a destra)
- **Keys & IDs** (nel menu laterale)
- Sezione **"REST API Key"**

**NOTA**: Non confondere con:
- ❌ App ID (quella è già nel codice)
- ❌ Safari Web ID (quello è già nel codice)
- ✅ REST API Key (questa serve per l'endpoint API)

