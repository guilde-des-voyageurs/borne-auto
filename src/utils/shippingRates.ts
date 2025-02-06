import { getShopifyShippingRates } from './shopifyApi';

interface ShippingRate {
  id: string;
  name: string;
  price: string;
}

interface CartItem {
  variant_id: string;
  quantity: number;
}

interface Address {
  first_name: string;
  last_name: string;
  address1: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
}

export async function getShippingRates(
  address: Address,
  items: Array<CartItem>
): Promise<ShippingRate[]> {
  try {
    const shopifyRates = await getShopifyShippingRates(address, items);
    return shopifyRates.map((rate) => ({
      id: rate.id,
      name: rate.name,
      price: rate.price,
    }));
  } catch (error) {
    console.error('Error getting shipping rates:', error);
    return [];
  }
}
