interface ShopifyShippingRate {
  service_name: string;
  service_code: string;
  price: string;
  currency: string;
  min_delivery_date?: string;
  max_delivery_date?: string;
}

export async function getShopifyShippingRates(address: {
  country: string;
  province?: string;
  city: string;
  zip: string;
}, items: Array<{
  variant_id: string;
  quantity: number;
}>) {
  try {
    const response = await fetch(`/api/shipping-rates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        items,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch shipping rates');
    }

    const data = await response.json();
    return data.shipping_rates as ShopifyShippingRate[];
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    throw error;
  }
}
