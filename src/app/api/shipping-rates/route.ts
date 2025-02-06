import { NextResponse } from 'next/server';

async function getShippingZones() {
  const url = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/shipping_zones.json`;
  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch shipping zones: ${errorText}`);
  }

  const data = await response.json();
  return data.shipping_zones;
}

async function getShippingRatesForZone(zone: any, weightInKg: number) {
  const rates = zone.weight_based_shipping_rates
    .map((rate: any) => {
      const minWeightKg = rate.weight_low ? parseFloat(rate.weight_low) : 0;
      const maxWeightKg = rate.weight_high ? parseFloat(rate.weight_high) : Infinity;
      const isValid = weightInKg >= minWeightKg && weightInKg <= maxWeightKg;

      return { rate, isValid };
    })
    .filter(({ isValid }) => isValid)
    .map(({ rate }) => ({
      service_name: rate.name,
      service_code: `${rate.id}`,
      handle: rate.id.toString(), 
      price: rate.price,
      currency: 'EUR'
    }));

  return rates;
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const { address, items } = JSON.parse(body);

    if (!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN) {
      throw new Error('Missing store domain configuration');
    }

    if (!process.env.SHOPIFY_ACCESS_TOKEN) {
      throw new Error('Missing access token configuration');
    }

    const totalWeight = items.reduce((sum: number, item: any) => {
      const itemWeight = parseFloat(item.weight) || 0;
      const itemTotalWeight = itemWeight * item.quantity;
      
      return sum + itemTotalWeight;
    }, 0);

    const shippingZones = await getShippingZones();

    const matchingZone = shippingZones.find((zone: any) => 
      zone.countries.some((country: any) => country.code === address.country)
    );

    if (!matchingZone) {
      return NextResponse.json({ shipping_rates: [] });
    }

    const rates = await getShippingRatesForZone(matchingZone, totalWeight);

    const response = { shipping_rates: rates };
    
    return NextResponse.json(response);

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
