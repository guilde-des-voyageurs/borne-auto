interface LineItem {
  variant_id: string;
  quantity: number;
}

export async function createDraftOrder(items: { [variantId: string]: any }) {
  try {
    console.log('Items envoyés à l\'API:', items);
    
    const response = await fetch('/api/draft-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
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
