import { useState, useEffect, useRef } from 'react';

interface ServiceWorkerRegistration extends ServiceWorkerRegistration {
  waiting?: ServiceWorker | null;
  installing?: ServiceWorker | null;
}

interface UsePWAUpdateOptions {
  autoUpdateDelay?: number; // Tempo in ms prima dell'aggiornamento automatico (0 = disabilitato)
}

export const usePWAUpdate = (options: UsePWAUpdateOptions = {}) => {
  const { autoUpdateDelay = 0 } = options;
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const autoUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    let registrationInstance: ServiceWorkerRegistration | null = null;

    // Funzione per controllare se c'è un aggiornamento
    const checkForUpdate = async () => {
      try {
        // Registra o recupera il service worker
        const reg = await navigator.serviceWorker.ready;
        registrationInstance = reg;
        setRegistration(reg);

        // Controlla se c'è un service worker in attesa
        if (reg.waiting) {
          setUpdateAvailable(true);
          
          // Se è configurato l'aggiornamento automatico, programma il reload
          if (autoUpdateDelay > 0 && !autoUpdateTimeoutRef.current) {
            autoUpdateTimeoutRef.current = setTimeout(() => {
              updateServiceWorker();
            }, autoUpdateDelay);
          }
          return;
        }

        // Controlla se c'è un service worker in installazione
        if (reg.installing) {
          const installingWorker = reg.installing;
          
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // C'è un nuovo service worker installato e pronto
              setUpdateAvailable(true);
              
              // Se è configurato l'aggiornamento automatico, programma il reload
              if (autoUpdateDelay > 0 && !autoUpdateTimeoutRef.current) {
                autoUpdateTimeoutRef.current = setTimeout(() => {
                  updateServiceWorker();
                }, autoUpdateDelay);
              }
            }
          });
        }

        // Ascolta gli aggiornamenti periodici
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nuovo service worker installato
                setUpdateAvailable(true);
                
                // Se è configurato l'aggiornamento automatico, programma il reload
                if (autoUpdateDelay > 0 && !autoUpdateTimeoutRef.current) {
                  autoUpdateTimeoutRef.current = setTimeout(() => {
                    updateServiceWorker();
                  }, autoUpdateDelay);
                }
              }
            });
          }
        });

      } catch (error) {
        console.error('Error checking for PWA update:', error);
      }
    };

    // Ascolta i messaggi dal service worker
    const handleControllerChange = () => {
      // Il service worker è stato aggiornato, ricarica la pagina
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Controlla immediatamente
    checkForUpdate();

    // Controlla periodicamente (ogni ora)
    const interval = setInterval(() => {
      if (registrationInstance) {
        registrationInstance.update();
      }
      checkForUpdate();
    }, 60 * 60 * 1000);

    // Controlla quando la pagina torna in focus
    const handleVisibilityChange = () => {
      if (!document.hidden && registrationInstance) {
        registrationInstance.update();
        checkForUpdate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      if (autoUpdateTimeoutRef.current) {
        clearTimeout(autoUpdateTimeoutRef.current);
      }
    };
  }, [autoUpdateDelay]);

  const updateServiceWorker = async () => {
    if (!registration || !registration.waiting) {
      return;
    }

    // Cancella l'aggiornamento automatico se era programmato
    if (autoUpdateTimeoutRef.current) {
      clearTimeout(autoUpdateTimeoutRef.current);
      autoUpdateTimeoutRef.current = null;
    }

    setIsUpdating(true);

    try {
      // Invia un messaggio al service worker in attesa per attivarlo
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Attendi che il nuovo service worker prenda il controllo
      await new Promise<void>((resolve) => {
        const handleControllerChange = () => {
          resolve();
        };
        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange, { once: true });
        
        // Fallback: se dopo 3 secondi non c'è stato il cambio, ricarica comunque
        setTimeout(() => {
          navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
          resolve();
        }, 3000);
      });

      // Ricarica la pagina per usare la nuova versione
      window.location.reload();
    } catch (error) {
      console.error('Error updating service worker:', error);
      setIsUpdating(false);
      // In caso di errore, prova comunque a ricaricare
      window.location.reload();
    }
  };

  const dismissUpdate = () => {
    setUpdateAvailable(false);
    // Cancella l'aggiornamento automatico se era programmato
    if (autoUpdateTimeoutRef.current) {
      clearTimeout(autoUpdateTimeoutRef.current);
      autoUpdateTimeoutRef.current = null;
    }
  };

  return {
    updateAvailable,
    isUpdating,
    updateServiceWorker,
    dismissUpdate,
  };
};
