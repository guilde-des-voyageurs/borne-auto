export interface ShippingRate {
  id: string;
  name: string;
  price: string;
  min_order_subtotal?: string;
  max_order_subtotal?: string;
}

export interface ShippingZone {
  id: number;
  name: string;
  countries: {
    id: number;
    name: string;
    code: string;
  }[];
  price_based_shipping_rates: ShippingRate[];
  weight_based_shipping_rates?: ShippingRate[];
}

export async function getShippingRates(countryCode: string): Promise<ShippingRate[]> {
  try {
    console.log('Fetching shipping rates for country:', countryCode);
    const response = await fetch('/api/shipping-zones');

    if (!response.ok) {
      console.error('Failed to fetch shipping zones. Status:', response.status);
      throw new Error('Failed to fetch shipping zones');
    }

    const data = await response.json();
    console.log('All shipping zones:', JSON.stringify(data, null, 2));

    const zones: ShippingZone[] = data.shipping_zones;
    
    // Trouver la zone qui correspond au pays
    const zone = zones.find(zone => 
      zone.countries.some(country => country.code === countryCode)
    );

    console.log('Found shipping zone for country:', zone);

    if (!zone) {
      console.log('No shipping zone found for country:', countryCode);
      return [];
    }

    // Vérifier d'abord les tarifs basés sur le prix
    let rates = zone.price_based_shipping_rates || [];
    
    // Si aucun tarif basé sur le prix n'est trouvé, utiliser les tarifs basés sur le poids
    if (rates.length === 0 && zone.weight_based_shipping_rates) {
      rates = zone.weight_based_shipping_rates;
    }

    console.log('Available shipping rates:', rates);

    // Retourner les tarifs d'expédition pour cette zone
    return rates.map(rate => ({
      id: rate.id.toString(),
      name: rate.name,
      price: rate.price
    }));
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    return [];
  }
}
