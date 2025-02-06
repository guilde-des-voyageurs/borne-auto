import { NextRequest, NextResponse } from 'next/server';
import { RouteHandler, ApiResponse } from '@/types/api';

interface DraftOrderLineItem {
  variant_id: string;
  quantity: number;
}

interface DraftOrderInput {
  line_items: DraftOrderLineItem[];
  customer?: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  shipping_address?: {
    first_name: string;
    last_name: string;
    address1: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone: string;
  };
}

interface DraftOrderResponse extends ApiResponse {
  draft_order: {
    id: string;
    order_id: string | null;
    name: string;
    customer: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
    };
    line_items: Array<{
      id: string;
      variant_id: string;
      product_id: string;
      title: string;
      variant_title: string;
      quantity: number;
      price: string;
    }>;
    shipping_address: {
      first_name: string;
      last_name: string;
      address1: string;
      city: string;
      province: string;
      country: string;
      zip: string;
      phone: string;
    };
    subtotal_price: string;
    total_price: string;
    created_at: string;
    updated_at: string;
  };
}

export const POST: RouteHandler = async (request: NextRequest) => {
  try {
    if (!process.env.SHOPIFY_STORE_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
      throw new Error('Missing Shopify credentials');
    }

    const body: DraftOrderInput = await request.json();

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

    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/draft_orders.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ draft_order: body }),
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

    const data: DraftOrderResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating draft order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
