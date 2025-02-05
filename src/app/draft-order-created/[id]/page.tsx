import { notFound } from 'next/navigation';
import CancelOrderButton from '@/components/CancelOrderButton';

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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DraftOrderCreated({
  params,
}: PageProps) {
  // Attendre les paramètres
  const resolvedParams = await params;
  const draftOrder = await getDraftOrder(resolvedParams.id);

  if (!draftOrder) {
    notFound();
  }

  // Utiliser le numéro de commande (D123) au lieu de l'ID interne
  const orderNumber = draftOrder.name;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 relative">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">
          La commande provisoire {orderNumber} a été créée
        </h1>
        
        <p className="text-xl text-gray-700">
          Appelez un vendeur du stand pour valider l&apos;expédition et le paiement
        </p>
      </div>

      <CancelOrderButton draftOrderId={resolvedParams.id} />
    </div>
  );
}
