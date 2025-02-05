import { NextResponse, NextRequest } from 'next/server';

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  postalCode: string;
  country: string;
  acceptsMarketing: boolean;
}

interface Item {
  variant_id: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const { customer, items } = await request.json();

    if (!customer || !items) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Construire l'adresse de livraison
    const shipping_address = {
      first_name: customer.firstName,
      last_name: customer.lastName,
      address1: customer.address1,
      city: customer.city,
      province: '',
      country: customer.country,
      zip: customer.postalCode,
      phone: customer.phone
    };

    // Préparer les données pour la création de la commande provisoire
    const draft_order = {
      line_items: items.map(item => ({
        variant_id: parseInt(item.variant_id),
        quantity: item.quantity
      })),
      customer: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        accepts_marketing: customer.acceptsMarketing
      },
      shipping_address,
      billing_address: shipping_address,
      use_customer_default_address: false
    };

    console.log('Creating draft order with:', JSON.stringify(draft_order, null, 2));

    // Créer la commande provisoire
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/draft_orders.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN || '',
        },
        body: JSON.stringify({ draft_order }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API error:', errorText);
      return NextResponse.json({ error: 'Failed to create draft order', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error creating draft order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
