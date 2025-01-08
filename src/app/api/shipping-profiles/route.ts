import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/shipping_zones.json`,
      {
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch shipping profiles');
    }

    const data = await response.json();

    // Convertir les données de l'API en format attendu
    const formattedProfiles = data.shipping_zones.map((profile: any) => ({
      id: profile.id,
      name: profile.name,
      countries: profile.countries.map((country: any) => ({
        id: country.id,
        name: country.name,
        code: country.code
      })),
      weight_based_shipping_rates: profile.weight_based_shipping_rates.map((rate: any) => ({
        id: rate.id,
        name: rate.name,
        weight_low: rate.weight_low,
        weight_high: rate.weight_high,
        price: parseFloat(rate.price)
      }))
    }));

    return NextResponse.json(formattedProfiles);
  } catch (error) {
    console.error('Error fetching shipping profiles:', error);
    return NextResponse.json({ error: 'Failed to fetch shipping profiles' }, { status: 500 });
  }
}
