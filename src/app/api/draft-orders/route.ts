import { NextResponse } from 'next/server';

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

export async function POST(request: Request) {
  try {
    if (!process.env.SHOPIFY_STORE_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
      throw new Error('Missing Shopify credentials');
    }

    const body = await request.json();
    console.log('Received body:', body);

    if (!body.line_items || !Array.isArray(body.line_items)) {
      console.error('Invalid line_items:', body.line_items);
      return NextResponse.json(
        { error: 'line_items must be an array' },
        { status: 400 }
      );
    }

    if (!body.customer) {
      console.error('Missing customer information');
      return NextResponse.json(
        { error: 'customer information is required' },
        { status: 400 }
      );
    }

    // S'assurer que variant_id est une string
    const formattedLineItems = body.line_items.map((item: any) => ({
      variant_id: item.variant_id.toString(),
      quantity: item.quantity
    }));

    // Construire l'adresse de livraison
    const shipping_address = {
      first_name: body.customer.firstName,
      last_name: body.customer.lastName,
      address1: body.customer.address1,
      city: body.customer.city,
      phone: body.customer.phone,
      zip: body.customer.postalCode,
      country_code: body.customer.country
    };

    // Préparer les données du client
    const customer = {
      first_name: body.customer.firstName,
      last_name: body.customer.lastName,
      email: body.customer.email,
      phone: body.customer.phone,
      accepts_marketing: body.customer.acceptsMarketing
    };

    // Logs détaillés du client
    console.log('=== INFORMATIONS CLIENT ===');
    console.log(`Nom: ${customer.first_name} ${customer.last_name}`);
    console.log(`Email: ${customer.email}`);
    console.log(`Téléphone: ${customer.phone}`);
    console.log('========================');

    // Debug: voir les données envoyées
    console.log('Customer data being sent:', customer);

    const draftOrderData = {
      draft_order: {
        line_items: formattedLineItems,
        customer,
        email: body.customer.email, // Ajouter l'email au niveau de la commande aussi
        shipping_address,
        use_customer_default_address: false,
        applied_discount: body.applied_discount // Ajouter la remise si elle existe
      }
    };

    if (body.shippingLine) {
      draftOrderData.draft_order.shipping_line = {
        title: body.shippingLine.title,
        price: body.shippingLine.price,
        custom: true
      };
    }

    // Debug: voir les données complètes envoyées à Shopify
    console.log('Data being sent to Shopify:', JSON.stringify(draftOrderData, null, 2));

    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/draft_orders.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
        },
        body: JSON.stringify(draftOrderData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Shopify API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create draft order' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in draft order creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
