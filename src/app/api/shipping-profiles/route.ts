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
    return NextResponse.json(data.shipping_zones);
  } catch (error) {
    console.error('Error fetching shipping profiles:', error);
    return NextResponse.json({ error: 'Failed to fetch shipping profiles' }, { status: 500 });
  }
}
