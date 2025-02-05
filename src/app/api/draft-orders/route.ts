import { NextResponse, NextRequest } from 'next/server';
import Shopify from '@shopify/shopify-api';

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  postalCode: string;
  country: string;
  acceptsMarketing: boolean;
}

interface Item {
  variant_id: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting draft order creation...');

    const { customer, items } = await request.json();

    console.log('Request body:', JSON.stringify({ customer, items }, null, 2));

    if (!customer || !items) {
      console.error('Missing required fields:', { customer: !!customer, items: !!items });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Vérifier les variables d'environnement
    console.log('Checking environment variables...');
    console.log('SHOPIFY_STORE_URL:', process.env.SHOPIFY_STORE_URL ? 'Present' : 'Missing');
    console.log('SHOPIFY_ACCESS_TOKEN:', process.env.SHOPIFY_ACCESS_TOKEN ? 'Present' : 'Missing');

    if (!process.env.SHOPIFY_STORE_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error('Missing Shopify credentials');
      return NextResponse.json({ 
        error: 'Configuration error', 
        details: 'Missing Shopify credentials' 
      }, { status: 500 });
    }

    // Construire l'adresse de livraison
    console.log('Building shipping address...');
    const shipping_address = {
      first_name: customer.firstName,
      last_name: customer.lastName,
      address1: customer.address1,
      city: customer.city,
      province: '',
      country: customer.country,
      zip: customer.postalCode,
      phone: customer.phone
    };

    // Convertir l'objet items en tableau de line_items
    console.log('Converting items to line_items...');
    console.log('Original items:', JSON.stringify(items, null, 2));
    
    const line_items = Object.entries(items).map(([variantId, item]: [string, any]) => {
      const id = variantId.split('/').pop()?.replace('ProductVariant/', '') || '0';
      console.log('Processing variant:', { original: variantId, extracted: id });
      return {
        variant_id: parseInt(id),
        quantity: item.quantity
      };
    });

    console.log('Converted line_items:', JSON.stringify(line_items, null, 2));

    // Préparer les données pour la création de la commande provisoire
    const draft_order = {
      line_items,
      customer: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        accepts_marketing: customer.acceptsMarketing
      },
      shipping_address,
      billing_address: shipping_address,
      use_customer_default_address: false
    };

    console.log('Draft order payload:', JSON.stringify(draft_order, null, 2));

    // Construire l'URL de l'API Shopify
    const shopifyUrl = `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/draft_orders.json`;
    console.log('Shopify URL:', shopifyUrl);

    // Créer la commande provisoire
    console.log('Sending request to Shopify...');
    const response = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
      },
      body: JSON.stringify({ draft_order })
    });

    console.log('Shopify response status:', response.status);
    const responseText = await response.text();
    console.log('Shopify response:', responseText);

    if (!response.ok) {
      console.error('Shopify API error:', responseText);
      return NextResponse.json({ 
        error: 'Failed to create draft order', 
        details: responseText,
        status: response.status
      }, { status: response.status });
    }

    const data = JSON.parse(responseText);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error creating draft order:', error);
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
