import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    if (!process.env.SHOPIFY_STORE_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
      throw new Error('Missing Shopify credentials');
    }

    const resolvedParams = await params;
    const draftOrderId = resolvedParams.id;

    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/draft_orders/${draftOrderId}.json`,
      {
        method: 'DELETE',
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Shopify API error:', errorData);
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
