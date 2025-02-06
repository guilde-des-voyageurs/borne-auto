'use client';

import { useState, useEffect } from 'react';

export function useDraftOrderStatus() {
  const [inProgress, setInProgress] = useState(false);

  const updateStatus = async (status: boolean) => {
    setInProgress(status);
    try {
      const response = await fetch('/api/draft-order-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inProgress: status }),
      });
      await response.json();
    } catch (error) {
      // Gérer l'erreur silencieusement
    }
  };

  useEffect(() => {
    updateStatus(true);
    return () => {
      updateStatus(false);
    };
  }, []);

  return inProgress;
}
