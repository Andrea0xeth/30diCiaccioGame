import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Register service worker for PWA
// VitePWA gestisce automaticamente la registrazione, ma qui aggiungiamo
// supporto per messaggi di aggiornamento
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Ascolta messaggi dal service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          // Il service worker ha rilevato un aggiornamento
          console.log('Service worker update detected');
        }
      });

      // Controlla periodicamente gli aggiornamenti
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Ogni ora

      // Controlla quando la pagina torna visibile
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          registration.update();
        }
      });
    } catch (error) {
      console.log('SW registration failed:', error);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
