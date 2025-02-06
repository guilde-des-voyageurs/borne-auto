'use client';

import CancelOrderButton from '@/components/CancelOrderButton';
import DraftOrderDisplay from '@/components/DraftOrderDisplay';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Commande non trouvée</h1>
          <p className="text-xl text-gray-300 mb-4">
            Veuillez vérifier l&apos;ID de la commande.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">🎉 Commande créée avec succès !</h1>
        <DraftOrderDisplay 
          name={searchParams.name} 
          draftOrderId={resolvedParams.id} 
          orderNumber={draftOrder.name}
        />
        <p className="text-xl text-gray-300 mb-8">
          Nous allons la traiter dans les plus brefs délais.
        </p>
        <button
          onClick={() => useRouter().push('/')}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    </main>
  );
}
