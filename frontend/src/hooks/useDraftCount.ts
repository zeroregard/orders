import { useState, useEffect } from 'react';
import { getOrders } from '../api/backend';

export function useDraftCount() {
  const [draftCount, setDraftCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchDraftCount = async () => {
    try {
      const draftOrders = await getOrders({ draftsOnly: true });
      setDraftCount(draftOrders.length);
    } catch (error) {
      console.error('Failed to fetch draft count:', error);
      setDraftCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDraftCount();
    
    // Set up an interval to refresh draft count every 30 seconds
    const interval = setInterval(fetchDraftCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { draftCount, loading, refetch: fetchDraftCount };
} 