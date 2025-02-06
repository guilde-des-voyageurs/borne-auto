'use server';

import CancelOrderButton from '@/components/CancelOrderButton';
import SoundButton from '@/components/SoundButton';

async function getDraftOrder(draftOrderId: string) {
  if (!process.env.SHOPIFY_STORE_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
    throw new Error('Missing Shopify credentials');
  }

  const response = await fetch(
    `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/draft_orders/${draftOrderId}.json`,
    {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
      },
      cache: 'no-store'
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch draft order');
  }

  const data = await response.json();
  return data.draft_order;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DraftOrderCreatedPage({ params }: Props) {
  // Attendre les paramètres
  const resolvedParams = await params;
  const draftOrder = await getDraftOrder(resolvedParams.id);

  if (!draftOrder) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Commande non trouvée
          </h1>
        </div>
      </div>
    );
  }

  // Utiliser le numéro de commande (D123) au lieu de l'ID interne
  const orderNumber = draftOrder.name;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 relative">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center space-y-8">
        <h1 className="text-4xl font-bold text-green-600">
          Commande {orderNumber} en cours de création
        </h1>
        <p className="text-xl text-gray-600">
          Votre commande est en cours de préparation. Veuillez patienter...
        </p>
      </div>

      <div className="mt-8 w-full max-w-2xl space-y-4">
        <CancelOrderButton draftOrderId={resolvedParams.id} />
        <SoundButton />
      </div>
    </div>
  );
}
