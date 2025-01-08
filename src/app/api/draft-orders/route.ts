import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    console.log('Items reçus:', items);

    // Convertir les items du panier en format Shopify
    const line_items = Object.entries(items).map(([variantId, item]: [string, any]) => {
      // Extraire uniquement l'ID numérique de la variante
      const numericId = variantId.split('/').pop();
      console.log('Conversion variantId:', { original: variantId, numericId });
      
      return {
        variant_id: numericId,
        quantity: item.quantity
      };
    });

    console.log('Line items formatés:', line_items);

    const draftOrderData = {
      draft_order: {
        line_items,
        note: "Commande créée depuis la borne automatique",
        tags: "borne-auto"
      }
    };

    console.log('Données envoyées à Shopify:', JSON.stringify(draftOrderData, null, 2));

    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/draft_orders.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftOrderData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API error:', errorText);
      return NextResponse.json(
        { error: `Shopify API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating draft order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
