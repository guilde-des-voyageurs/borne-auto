import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = {
      country: searchParams.get('country'),
      province: searchParams.get('province') || '',
      city: searchParams.get('city') || '',
      zip: searchParams.get('zip') || '',
      address1: searchParams.get('address1') || ''
    };

    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/shipping_rates.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rate: {
            destination: address,
            items: [
              {
                quantity: 1,
                grams: 1000, // Poids par défaut de 1kg
                price: 1000, // Prix par défaut de 10€
                requires_shipping: true
              }
            ]
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API error:', errorText);
      return NextResponse.json(
        { error: `Shopify API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
