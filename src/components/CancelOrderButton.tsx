'use client';

interface CancelOrderButtonProps {
  draftOrderId: string;
}

export default function CancelOrderButton({ draftOrderId }: CancelOrderButtonProps) {
  const handleCancel = async () => {
    // Au lieu de supprimer la commande, on redirige simplement vers l'accueil
    window.location.href = '/';
  };

  return (
    <button
      onClick={handleCancel}
      className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors"
    >
      Retour à l&apos;accueil
    </button>
  );
}
