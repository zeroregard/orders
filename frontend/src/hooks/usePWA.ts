import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function usePWA() {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error: Error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setShowUpdateNotification(true);
    }
  }, [needRefresh]);

  const handleUpdate = () => {
    updateServiceWorker(true);
    setShowUpdateNotification(false);
  };

  const handleDismiss = () => {
    setShowUpdateNotification(false);
    setNeedRefresh(false);
  };

  return {
    offlineReady,
    needRefresh,
    showUpdateNotification,
    handleUpdate,
    handleDismiss,
    updateServiceWorker,
  };
} 