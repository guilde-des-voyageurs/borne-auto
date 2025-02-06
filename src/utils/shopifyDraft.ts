interface LineItem {
  variant_id: string;
  quantity: number;
}

interface Customer {
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

interface DraftOrderInput {
  items: { [variantId: string]: any };
  shippingLine?: {
    title: string;
    price: string;
    shippingRateId: string;
  };
  customer: Customer;
}

export async function createDraftOrder(
  items: any[],
  shippingLine: any,
  customer: any
) {
  try {
    const response = await fetch('/api/draft-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items,
        shipping_line: shippingLine,
        customer,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create draft order');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}
