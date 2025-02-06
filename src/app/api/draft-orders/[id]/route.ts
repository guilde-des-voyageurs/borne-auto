import { NextResponse } from 'next/server';

interface Props {
  params: {
    id: string;
  };
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    if (!process.env.SHOPIFY_STORE_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
      throw new Error('Missing Shopify credentials');
    }

    const draftOrderId = params.id;

    // Appeler l'API Shopify pour supprimer la commande
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/draft_orders/${draftOrderId}.json`,
      {
        method: 'DELETE',
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete draft order');
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting draft order:', error);
    return NextResponse.json(
      { error: 'Failed to delete draft order' },
      { status: 500 }
    );
  }
}
