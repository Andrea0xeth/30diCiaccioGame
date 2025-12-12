# 📱 Come Funzionano le Notifiche Push

## ✅ Sì, Funzionano Anche con l'App Chiusa!

Le notifiche push sono **diverse** dalle notifiche in-app. Funzionano anche quando:
- ❌ L'app è chiusa
- ❌ Il browser è chiuso
- ❌ Il dispositivo è in standby

## 🔄 Come Funziona il Sistema

### 1. **Registrazione (Una Volta)**
Quando l'utente abilita le notifiche push:
- Il browser crea una **subscription** unica
- La subscription viene salvata nel database (`push_subscriptions`)
- Questa subscription contiene:
  - `endpoint`: URL del servizio push del browser (es: Chrome, Firefox, Safari)
  - `p256dh`: Chiave pubblica per la crittografia
  - `auth`: Chiave di autenticazione

### 2. **Invio Notifica (Admin)**
Quando invii una notifica dal pannello admin:
- L'Edge Function aggiunge la notifica alla **coda** (`push_notifications_queue`)
- La notifica ha status `pending`

### 3. **Worker Processa la Coda (Ogni 5 Minuti)**
Il cron job su Vercel (ogni 5 minuti):
- Legge le notifiche `pending` dalla coda
- Per ogni notifica:
  - Recupera le **subscription** dell'utente dal database
  - Invia la notifica usando `web-push` all'`endpoint` salvato
  - Il browser (Chrome, Firefox, Safari) riceve la notifica
  - Il browser mostra la notifica anche se l'app è chiusa!

### 4. **Ricezione Notifica**
- Il browser riceve la notifica dal suo servizio push
- Mostra la notifica come popup/alert
- L'utente può cliccare per aprire l'app

## 🔑 Punti Chiave

1. **Le subscription sono salvate nel database** → Non serve che l'app sia aperta
2. **Il worker invia direttamente al browser** → Usa l'`endpoint` salvato
3. **Il browser gestisce la notifica** → Anche se l'app è chiusa
4. **Funziona su mobile e desktop** → Chrome, Firefox, Safari supportano Web Push

## 📊 Esempio Pratico

1. Utente apre l'app → Abilita notifiche push → Subscription salvata nel DB
2. Utente chiude l'app e spegne il telefono
3. Admin invia notifica → Aggiunta alla coda
4. Worker (dopo max 5 min) → Legge dalla coda → Invia al browser
5. Browser riceve → Mostra notifica anche con telefono spento (quando si riaccende)
6. Utente vede la notifica → Clicca → App si apre

## ⚠️ Limitazioni

- **Richiede che l'utente abbia abilitato le notifiche** (una volta)
- **Richiede che il browser sia installato** (Chrome, Firefox, Safari)
- **Su iOS Safari**: Funziona solo se l'app è installata come PWA
- **Su Android Chrome**: Funziona sempre se l'utente ha dato il permesso

## ✅ Vantaggi

- ✅ Notifiche anche con app chiusa
- ✅ Notifiche anche con browser chiuso
- ✅ Funziona su mobile e desktop
- ✅ Non consuma batteria (il browser gestisce tutto)
- ✅ Notifiche in tempo reale (max 5 min di delay)

## 🎯 In Sintesi

**SÌ, il worker invierà le notifiche anche se nessun dispositivo ha l'app aperta!**

Le subscription sono salvate nel database, quindi il worker può inviarle in qualsiasi momento. Il browser riceverà e mostrerà la notifica anche se l'app è chiusa.

