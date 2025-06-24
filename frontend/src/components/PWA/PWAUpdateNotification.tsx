import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

interface PWAUpdateNotificationProps {
  onUpdate: () => void;
  onDismiss: () => void;
  show: boolean;
}

export function PWAUpdateNotification({ onUpdate, onDismiss, show }: PWAUpdateNotificationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-lg shadow-lg border border-purple-500/20">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Download size={20} className="text-white/90" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">App Update Available</h4>
                <p className="text-xs text-white/80 mb-3">
                  A new version of Auto Order is available. Update now to get the latest features and improvements.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={onUpdate}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                  >
                    Update Now
                  </button>
                  <button
                    onClick={onDismiss}
                    className="text-white/80 hover:text-white px-3 py-1.5 rounded-md text-xs transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
              <button
                onClick={onDismiss}
                className="flex-shrink-0 text-white/60 hover:text-white/80 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 