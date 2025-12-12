# 📱 Dove Riceve le Notifiche Push l'Utente?

## 🖥️ Desktop (Windows, macOS, Linux)

### Chrome / Edge / Brave
- **Notifica nativa del sistema operativo**
- Appare in basso a destra (Windows) o in alto a destra (macOS)
- Mostra: icona, titolo, messaggio
- L'utente può cliccare per aprire l'app nel browser

### Firefox
- **Notifica nativa del sistema operativo**
- Stessa posizione di Chrome
- Funziona su Windows, macOS, Linux

### Safari (macOS)
- **Notifica nativa di macOS**
- Appare in alto a destra
- Integrata con il sistema di notifiche macOS

## 📱 Mobile

### Android (Chrome)
- **Notifica nella barra delle notifiche**
- Appare in alto dello schermo
- L'utente può:
  - Vedere la notifica nella barra
  - Tirare giù per vedere i dettagli
  - Cliccare per aprire l'app
- Funziona anche con lo schermo bloccato (se permesso)

### iOS (Safari - PWA installata)
- **Notifica come app nativa**
- Appare in alto dello schermo
- Solo se l'app è installata come PWA (Add to Home Screen)
- Funziona anche con lo schermo bloccato

### iOS (Safari - Non installata)
- ⚠️ **NON funziona** - Safari su iOS non supporta Web Push per siti web normali
- Serve installare come PWA

## 🎯 Esempi Visivi

### Desktop
```
┌─────────────────────────────┐
│  [Icona] Titolo Notifica    │
│  Messaggio della notifica   │
│  Clicca per aprire          │
└─────────────────────────────┘
     ↑
  Appare qui (angolo schermo)
```

### Mobile Android
```
┌─────────────────────────────┐
│ 🔔 Nuova Notifica           │ ← Barra notifiche
│ ─────────────────────────── │
│ [Icona] Titolo              │
│ Messaggio                   │
│ [Apri] [Chiudi]             │
└─────────────────────────────┘
```

## 🔔 Cosa Vede l'Utente

Quando riceve una notifica push, vede:

1. **Icona** - L'icona dell'app (pwa-192x192.png)
2. **Titolo** - Il titolo che hai impostato
3. **Messaggio** - Il corpo della notifica
4. **Badge** - Piccola icona nella barra (se supportato)

## 📍 Posizione Esatta

### Windows
- **Angolo in basso a destra** dello schermo
- Nella "Action Center" di Windows

### macOS
- **Angolo in alto a destra** dello schermo
- Nel "Notification Center" di macOS

### Android
- **In alto** dello schermo (barra notifiche)
- Nella "Notification Shade" quando si tira giù

### iOS (PWA installata)
- **In alto** dello schermo
- Come le notifiche delle app native

## ⚙️ Impostazioni Utente

L'utente può:
- ✅ **Abilitare/Disabilitare** le notifiche dalle impostazioni del browser
- ✅ **Scegliere il suono** delle notifiche
- ✅ **Scegliere se mostrare** anche con schermo bloccato (mobile)
- ✅ **Bloccare notifiche** da siti specifici

## 🎨 Personalizzazione

Puoi personalizzare:
- **Icona** - Cambia `icon` nel payload
- **Badge** - Cambia `badge` nel payload
- **Suono** - Aggiungi `sound` nel payload (se supportato)
- **Vibrazione** - Aggiungi `vibrate` nel payload (mobile)

## ✅ In Sintesi

**L'utente riceve le notifiche:**
- 🖥️ **Desktop**: Notifiche native del sistema operativo (angolo schermo)
- 📱 **Android**: Barra notifiche in alto
- 📱 **iOS**: Solo se PWA installata, come app nativa

**Funziona anche con:**
- ❌ App chiusa
- ❌ Browser chiuso (su mobile)
- ❌ Schermo bloccato (se permesso)

