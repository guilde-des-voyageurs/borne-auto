'use server';

import CancelOrderButton from '@/components/CancelOrderButton';
import DraftOrderDisplay from '@/components/DraftOrderDisplay';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: { name?: string };
}

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

export default async function DraftOrderCreatedPage({ params, searchParams }: Props) {
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

  return <DraftOrderDisplay 
    name={searchParams.name} 
    draftOrderId={resolvedParams.id} 
    orderNumber={draftOrder.name}
  />;
}
