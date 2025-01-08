import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, shippingLine, customer } = body;

    console.log('Items reçus:', items);
    console.log('Méthode d\'expédition reçue:', shippingLine);
    console.log('Informations client reçues:', customer);

    // Convertir les items du panier en format Shopify
    const line_items = Object.entries(items).map(([variantId, item]: [string, any]) => {
      // Extraire uniquement l'ID numérique de la variante
      const numericId = variantId.split('/').pop()?.replace('ProductVariant/', '') || '';
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
        tags: "borne-auto",
        shipping_line: shippingLine ? {
          title: shippingLine.title,
          custom: true,
          price: shippingLine.price,
          source: shippingLine.shippingRateId
        } : undefined,
        customer: {
          first_name: customer.firstName,
          last_name: customer.lastName,
          email: customer.email,
          phone: customer.phone
        },
        shipping_address: {
          first_name: customer.firstName,
          last_name: customer.lastName,
          address1: customer.address1,
          city: customer.city,
          zip: customer.postalCode,
          country: customer.country,
          phone: customer.phone
        }
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
