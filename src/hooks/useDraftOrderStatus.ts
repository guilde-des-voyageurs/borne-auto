import { useEffect } from 'react';

export function useDraftOrderStatus() {
  useEffect(() => {
    // Informer le serveur qu'une commande est en cours de création
    const updateStatus = async (inProgress: boolean) => {
      console.log('Updating draft order status:', inProgress);
      try {
        const response = await fetch('/api/draft-order-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inProgress }),
        });
        
        const data = await response.json();
        console.log('Status update response:', data);
      } catch (error) {
        console.error('Error updating draft order status:', error);
      }
    };

    console.log('Draft order page mounted, setting status to true');
    // Mettre à jour le statut quand la page est chargée
    updateStatus(true);

    // Nettoyer quand la page est fermée
    return () => {
      console.log('Draft order page unmounted, setting status to false');
      updateStatus(false);
    };
  }, []);
}
