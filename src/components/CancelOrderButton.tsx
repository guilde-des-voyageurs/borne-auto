'use client';

interface Props {
  draftOrderId: string;
}

export default function CancelOrderButton({ draftOrderId }: Props) {
  const handleCancel = async () => {
    try {
      // Appeler l'API pour supprimer la commande
      const response = await fetch(`/api/draft-orders/${draftOrderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      // Rediriger vers la page d'accueil
      window.location.href = '/';
      
    } catch (error) {
      console.error('Error canceling order:', error);
      alert('Une erreur est survenue lors de l\'annulation de la commande');
    }
  };

  return (
    <button
      onClick={handleCancel}
      className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors shadow-lg"
    >
      Annuler ma commande
    </button>
  );
}
