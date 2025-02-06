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
      province: '',
      country: body.customer.country,
      zip: body.customer.postalCode,
      phone: body.customer.phone
    };

    console.log('Formatted line items:', formattedLineItems);
    console.log('Customer info:', body.customer);

    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/draft_orders.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
        },
        body: JSON.stringify({
          draft_order: {
            line_items: formattedLineItems,
            customer: {
              first_name: body.customer.firstName,
              last_name: body.customer.lastName,
              email: body.customer.email,
              phone: body.customer.phone,
              accepts_marketing: body.customer.acceptsMarketing
            },
            shipping_address,
            billing_address: shipping_address,
            use_customer_default_address: false
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Shopify API error:', errorData);
      throw new Error('Failed to create draft order');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error creating draft order:', error);
    return NextResponse.json(
      { error: 'Failed to create draft order' },
      { status: 500 }
    );
  }
}
