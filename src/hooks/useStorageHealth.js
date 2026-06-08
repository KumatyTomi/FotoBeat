import { useEffect, useState } from 'react';
import { getStorageHealth } from '../utils/storageHealth.js';

export function useStorageHealth(refreshKey = 0) {
  const [storageHealth, setStorageHealth] = useState({
    supported: false,
    usage: 0,
    quota: 0,
    usageRatio: 0,
    warningLevel: 'unknown',
    message: 'Storage health jeszcze nie zostało sprawdzone.'
  });

  useEffect(() => {
    let cancelled = false;

    getStorageHealth()
      .then((health) => {
        if (!cancelled) setStorageHealth(health);
      })
      .catch(() => {
        if (!cancelled) {
          setStorageHealth({
            supported: false,
            usage: 0,
            quota: 0,
            usageRatio: 0,
            warningLevel: 'unknown',
            message: 'Nie udało się sprawdzić storage przeglądarki.'
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return storageHealth;
}
