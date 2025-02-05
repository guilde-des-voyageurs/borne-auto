import { NextRequest, NextResponse } from 'next/server';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: NextRequest,
  { params }: Props
) {
  try {
    // Vérifier les variables d'environnement
    if (!process.env.SHOPIFY_STORE_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error('Missing Shopify credentials');
      return NextResponse.json({ 
        error: 'Configuration error', 
        details: 'Missing Shopify credentials' 
      }, { status: 500 });
    }

    // Récupérer les données de la requête
    const data = await request.json();
    const { shipping_line } = data;

    if (!shipping_line) {
      return NextResponse.json({ 
        error: 'Missing shipping_line', 
        details: 'shipping_line is required in the request body' 
      }, { status: 400 });
    }

    // Mettre à jour la commande provisoire avec la nouvelle méthode d'expédition
    const updateUrl = new URL(`https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/draft_orders/${params.id}.json`);
    
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
      },
      body: JSON.stringify({
        draft_order: {
          shipping_line: {
            title: shipping_line.name,
            price: shipping_line.price,
            code: shipping_line.service_code,
            custom: true
          }
        }
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Error updating draft order:', errorText);
      return NextResponse.json({ 
        error: 'Failed to update draft order', 
        details: errorText 
      }, { status: updateResponse.status });
    }

    const updatedDraftOrder = await updateResponse.json();
    return NextResponse.json(updatedDraftOrder);

  } catch (error) {
    console.error('Error updating shipping method:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
    }, { status: 500 });
  }
}
