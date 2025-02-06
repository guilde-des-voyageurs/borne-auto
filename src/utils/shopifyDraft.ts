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

interface DraftOrderResponse {
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

export async function createDraftOrder(data: DraftOrderInput): Promise<DraftOrderResponse> {
  const response = await fetch(
    `${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/draft_orders.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ draft_order: data }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create draft order');
  }

  return response.json();
}

export async function updateDraftOrder(
  id: string,
  data: Partial<DraftOrderInput>
): Promise<DraftOrderResponse> {
  const response = await fetch(
    `${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/draft_orders/${id}.json`,
    {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ draft_order: data }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update draft order');
  }

  return response.json();
}
