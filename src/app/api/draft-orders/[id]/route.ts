import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!process.env.SHOPIFY_STORE_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Missing Shopify credentials' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/draft_orders/${params.id}.json`,
      {
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch draft order' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching draft order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draft order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!process.env.SHOPIFY_STORE_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Missing Shopify credentials' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/draft_orders/${params.id}.json`,
      {
        method: 'DELETE',
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to delete draft order' },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting draft order:', error);
    return NextResponse.json(
      { error: 'Failed to delete draft order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!process.env.SHOPIFY_STORE_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Missing Shopify credentials' },
        { status: 500 }
      );
    }

    const body = await request.json();

    const response = await fetch(
      `${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/draft_orders/${params.id}.json`,
      {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to update draft order' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating draft order:', error);
    return NextResponse.json(
      { error: 'Failed to update draft order' },
      { status: 500 }
    );
  }
}
