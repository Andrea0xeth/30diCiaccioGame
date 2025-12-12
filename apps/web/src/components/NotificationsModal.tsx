import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle2, Trophy, Gift, Zap } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { supabase } from '../lib/supabase';
import type { Notifica } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (tipo: Notifica['tipo']) => {
  switch (tipo) {
    case 'quest':
      return <Zap className="text-yellow-400" size={20} />;
    case 'gara':
      return <Trophy className="text-coral-400" size={20} />;
    case 'bonus':
      return <Gift className="text-turquoise-400" size={20} />;
    default:
      return <Bell className="text-gray-400" size={20} />;
  }
};

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifiche, user, refreshData } = useGame();

  const unreadCount = notifiche.filter(n => !n.letta).length;
  const sortedNotifiche = [...notifiche].sort((a, b) => {
    // Non lette prima
    if (a.letta !== b.letta) return a.letta ? 1 : -1;
    // Poi per data (più recenti prima)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleMarkAsRead = async (notificaId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('notifiche')
        .update({ letta: true })
        .eq('id', notificaId)
        .eq('user_id', user.id);

      // Ricarica i dati per aggiornare lo stato
      await refreshData();
    } catch (error) {
      console.error('Errore aggiornamento notifica:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || unreadCount === 0) return;

    try {
      await supabase
        .from('notifiche')
        .update({ letta: true })
        .eq('user_id', user.id)
        .eq('letta', false);

      await refreshData();
    } catch (error) {
      console.error('Errore aggiornamento notifiche:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-strong rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="text-coral-400" size={24} />
              <h2 className="text-xl font-bold text-white">Notifiche</h2>
              {unreadCount > 0 && (
                <span className="bg-coral-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-coral-400 hover:text-coral-300 transition-colors"
                >
                  Segna tutte come lette
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-700/50 transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Notifiche List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {sortedNotifiche.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="text-gray-600 mx-auto mb-3" size={48} />
                <p className="text-gray-500">Nessuna notifica</p>
              </div>
            ) : (
              sortedNotifiche.map((notifica) => (
                <motion.div
                  key={notifica.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`card p-4 cursor-pointer transition-all ${
                    !notifica.letta
                      ? 'border-l-4 border-coral-500 bg-coral-500/5'
                      : 'opacity-70'
                  }`}
                  onClick={() => !notifica.letta && handleMarkAsRead(notifica.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notifica.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-semibold text-sm ${
                          !notifica.letta ? 'text-white' : 'text-gray-400'
                        }`}>
                          {notifica.titolo}
                        </h3>
                        {!notifica.letta && (
                          <span className="w-2 h-2 bg-coral-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className={`text-sm ${
                        !notifica.letta ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {notifica.messaggio}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notifica.created_at).toLocaleString('it-IT', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

