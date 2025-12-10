import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallPromptProps {
  delay?: number; // Delay in milliseconds before showing the prompt
  autoShow?: boolean; // Automatically show the prompt when installable
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ 
  delay = 2000,
  autoShow = true 
}) => {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const dismissedKey = 'pwa-install-dismissed';
    const dismissedTime = localStorage.getItem(dismissedKey);
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    if (dismissedTime && parseInt(dismissedTime) > oneDayAgo) {
      setDismissed(true);
      return;
    }

    // Auto-show prompt after delay if installable
    if (autoShow && isInstallable && !isInstalled && !dismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, autoShow, delay, dismissed]);

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    // Remember dismissal for 24 hours
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed or not installable
  if (isInstalled || !isInstallable || dismissed) {
    return null;
  }

  // iOS instructions (no programmatic install)
  if (isIOS) {
    return (
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="glass rounded-2xl p-5 shadow-2xl max-w-md mx-auto border border-white/10">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-coral-500 to-turquoise-500 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-1">
                    Installa l'app
                  </h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Aggiungi questa app alla tua schermata Home per un'esperienza migliore!
                  </p>
                  <div className="bg-dark/50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-400 mb-2 font-medium">Come installare:</p>
                    <ol className="text-xs text-gray-300 space-y-1 list-decimal list-inside">
                      <li>Tocca il pulsante <span className="font-semibold text-white">Condividi</span> <span className="text-gray-500">(□↑)</span></li>
                      <li>Seleziona <span className="font-semibold text-white">"Aggiungi alla schermata Home"</span></li>
                      <li>Conferma con <span className="font-semibold text-white">"Aggiungi"</span></li>
                    </ol>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                  aria-label="Chiudi"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Android/Chrome install prompt
  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="glass rounded-2xl p-5 shadow-2xl max-w-md mx-auto border border-white/10">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-coral-500 to-turquoise-500 rounded-xl flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1">
                  Installa l'app
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Installa questa app per un'esperienza migliore e per giocare offline!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleInstall}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm"
                  >
                    <Download size={18} />
                    Installa ora
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Dopo
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                aria-label="Chiudi"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
