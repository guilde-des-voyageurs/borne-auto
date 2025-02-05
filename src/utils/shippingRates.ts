import { SHIPPING_METHODS, type ShippingMethod } from '../config/shipping';
import { getShopifyShippingRates } from './shopifyApi';

export interface ShippingRate {
  id: string;
  name: string;
  price: string;
}

interface CartWeight {
  total: number;
  unit: string;
}

export function calculateTotalWeight(items: Array<{ weight: number; weight_unit: string; quantity: number }>): CartWeight {
  return items.reduce((acc, item) => {
    // Convertir en kg si nécessaire
    const weightInKg = item.weight_unit === 'g' ? item.weight / 1000 : item.weight;
    return {
      total: acc.total + (weightInKg * item.quantity),
      unit: 'kg'
    };
  }, { total: 0, unit: 'kg' });
}

function getShippingPrice(method: ShippingMethod, weight: number, orderTotal: number): string {
  // Vérifier les limites de poids
  if (method.restrictions?.maxWeight && weight > method.restrictions.maxWeight) {
    return '0';  // Retourne 0 pour indiquer que cette méthode n'est pas disponible
  }

  // Trouver le tarif basé sur le poids
  const weightRate = method.weightRates
    .slice()
    .sort((a, b) => a.maxWeight - b.maxWeight)
    .find(rate => weight <= rate.maxWeight);

  if (!weightRate) {
    return '0';  // Poids trop élevé pour cette méthode
  }

  // Vérifier les tarifs basés sur le prix de la commande
  const priceRate = method.priceRates
    .slice()
    .sort((a, b) => b.minOrderValue - a.minOrderValue)  // Du plus élevé au plus bas
    .find(rate => orderTotal >= rate.minOrderValue);

  // Retourner le tarif approprié
  return priceRate ? priceRate.price : weightRate.price;
}

export async function getShippingRates(
  address: {
    country: string;
    province?: string;
    city: string;
    zip: string;
  },
  items: Array<{
    variant_id: string;
    quantity: number;
  }>
): Promise<ShippingRate[]> {
  try {
    const shopifyRates = await getShopifyShippingRates(address, items);
    
    return shopifyRates.map(rate => ({
      id: rate.service_code,
      name: rate.service_name,
      price: rate.price
    }));
  } catch (error) {
    console.error('Error getting shipping rates:', error);
    return [];
  }
}
