import { usePWAUpdate } from '../hooks/usePWAUpdate';
import { useEffect } from 'react';

export const UpdateNotification = () => {
  const { updateAvailable, isUpdating, updateServiceWorker } = usePWAUpdate({ autoUpdateDelay: 2000 });

  // Aggiorna automaticamente quando viene rilevato un aggiornamento
  useEffect(() => {
    if (updateAvailable && !isUpdating) {
      // Aspetta 2 secondi per dare tempo all'utente di vedere il messaggio, poi aggiorna automaticamente
      const timer = setTimeout(() => {
        updateServiceWorker();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [updateAvailable, isUpdating, updateServiceWorker]);

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-coral-500 to-coral-600 text-white shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <svg
            className="w-6 h-6 flex-shrink-0 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <div>
            <p className="font-semibold">Aggiornamento disponibile!</p>
            <p className="text-sm opacity-90">
              {isUpdating 
                ? 'Aggiornamento in corso...' 
                : 'Aggiornamento automatico tra 2 secondi...'}
            </p>
          </div>
        </div>
        {isUpdating && (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm font-medium">Aggiornamento...</span>
          </div>
        )}
      </div>
    </div>
  );
};



