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

export async function createDraftOrder({ items, shippingLine, customer }: DraftOrderInput) {
  try {
    console.log('Items envoyés à l\'API:', items);
    console.log('Méthode d\'expédition:', shippingLine);
    console.log('Informations client:', customer);
    
    const response = await fetch('/api/draft-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items, shippingLine, customer }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error creating draft order');
    }

    const data = await response.json();
    return data.draft_order;
  } catch (error) {
    console.error('Error creating draft order:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}
