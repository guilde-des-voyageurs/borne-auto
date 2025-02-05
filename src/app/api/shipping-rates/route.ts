import { NextResponse } from 'next/server';

async function getShippingZones() {
  const url = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/shipping_zones.json`;
  console.log('Fetching shipping zones from:', url);

  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Shipping zones error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`Failed to fetch shipping zones: ${errorText}`);
  }

  const data = await response.json();
  console.log('Received shipping zones:', JSON.stringify(data, null, 2));
  return data.shipping_zones;
}

async function getShippingRatesForZone(zone: any, weightInKg: number) {
  console.log('Weight received:', {
    weight_kg: weightInKg
  });

  // Afficher toutes les tranches de poids disponibles
  console.log('Available weight ranges:', zone.weight_based_shipping_rates.map((rate: any) => ({
    name: rate.name,
    weight_low_kg: rate.weight_low,
    weight_high_kg: rate.weight_high,
    price: rate.price
  })));

  // Filtrer les méthodes d'expédition basées sur le poids
  const rates = zone.weight_based_shipping_rates
    // D'abord, on log toutes les tranches
    .map((rate: any) => {
      // Les poids dans Shopify sont en kg
      const minWeightKg = rate.weight_low ? parseFloat(rate.weight_low) : 0;
      const maxWeightKg = rate.weight_high ? parseFloat(rate.weight_high) : Infinity;
      const isValid = weightInKg >= minWeightKg && weightInKg <= maxWeightKg;

      console.log('Evaluating rate:', {
        name: rate.name,
        min_weight_kg: minWeightKg,
        max_weight_kg: maxWeightKg === Infinity ? 'unlimited' : maxWeightKg,
        cart_weight_kg: weightInKg,
        is_valid: isValid,
        comparison: `${weightInKg} >= ${minWeightKg} && ${weightInKg} <= ${maxWeightKg}`
      });

      return { rate, isValid };
    })
    // Ensuite, on filtre et on formate
    .filter(({ isValid }) => isValid)
    .map(({ rate }) => ({
      service_name: rate.name,
      service_code: `${rate.id}`,
      price: rate.price,
      currency: 'EUR'
    }));

  console.log('Final rates:', rates);
  return rates;
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    console.log('Raw request body:', body);
    
    const { address, items } = JSON.parse(body);
    console.log('Processing shipping request:', { address, items });

    if (!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN) {
      console.error('Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN');
      throw new Error('Missing store domain configuration');
    }

    if (!process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error('Missing SHOPIFY_ACCESS_TOKEN');
      throw new Error('Missing access token configuration');
    }

    // Calculer le poids total en kg (les poids des items sont déjà en kg)
    const totalWeight = items.reduce((sum: number, item: any) => {
      const itemWeight = parseFloat(item.weight) || 0;
      // On garde tout en kg
      const itemTotalWeight = itemWeight * item.quantity;
      
      console.log('Item weight:', {
        variant_id: item.variant_id,
        weight_kg: itemWeight,
        quantity: item.quantity,
        total_weight_kg: itemTotalWeight
      });
      
      return sum + itemTotalWeight;
    }, 0);

    console.log('Cart total weight:', {
      weight_kg: totalWeight
    });

    // Récupérer les zones d'expédition
    const shippingZones = await getShippingZones();
    console.log('Retrieved shipping zones count:', shippingZones.length);

    // Trouver la zone correspondant au pays
    const matchingZone = shippingZones.find((zone: any) => 
      zone.countries.some((country: any) => country.code === address.country)
    );

    if (!matchingZone) {
      console.log('No matching shipping zone found for country:', address.country);
      return NextResponse.json({ shipping_rates: [] });
    }

    console.log('Found matching zone:', {
      name: matchingZone.name,
      countries: matchingZone.countries.map((c: any) => c.code)
    });

    // Obtenir les tarifs d'expédition pour cette zone
    const rates = await getShippingRatesForZone(matchingZone, totalWeight);

    const response = { shipping_rates: rates };
    console.log('Sending response:', JSON.stringify(response, null, 2));
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('Shipping rates error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
