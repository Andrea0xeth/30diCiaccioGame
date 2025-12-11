import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Register service worker for PWA
// Con registerType: 'prompt', VitePWA non registra automaticamente
// Il nostro hook usePWAUpdate gestirà la registrazione e il rilevamento aggiornamenti
// Non registriamo qui per evitare conflitti - lasciamo che usePWAUpdate gestisca tutto

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
