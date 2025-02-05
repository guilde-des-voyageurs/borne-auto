'use client';

interface CancelOrderButtonProps {
  draftOrderId: string;
}

export default function CancelOrderButton({ draftOrderId }: CancelOrderButtonProps) {
  const handleCancel = async () => {
    try {
      const response = await fetch(`/api/draft-orders/${draftOrderId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete draft order');
      }

      // Rediriger vers la page d'accueil
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting draft order:', error);
      alert('Une erreur est survenue lors de l\'annulation de la commande');
    }
  };

  return (
    <button
      onClick={handleCancel}
      className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors"
    >
      Annuler ma commande
    </button>
  );
}
