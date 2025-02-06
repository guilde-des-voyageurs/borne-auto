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
    const { line_items, customer, applied_discount } = body;

    if (!line_items || !Array.isArray(line_items)) {
      return NextResponse.json(
        { error: 'line_items must be an array' },
        { status: 400 }
      );
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'customer information is required' },
        { status: 400 }
      );
    }

    const customerData = {
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      addresses: [
        {
          address1: customer.address1,
          city: customer.city,
          province: '',
          zip: customer.postalCode,
          country_code: customer.country,
        },
      ],
      accepts_marketing: customer.acceptsMarketing,
    };

    const draftOrderData = {
      draft_order: {
        line_items,
        customer: customerData,
        email: customer.email,
        use_customer_default_address: false,
        ...(applied_discount && { applied_discount }),
      },
    };

    if (body.shippingLine) {
      draftOrderData.draft_order.shipping_line = {
        title: body.shippingLine.title,
        price: body.shippingLine.price,
        custom: true
      };
    }

    const url = new URL('/admin/api/2024-01/draft_orders.json', process.env.SHOPIFY_STORE_URL);
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN || '',
      },
      body: JSON.stringify(draftOrderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to create draft order' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
