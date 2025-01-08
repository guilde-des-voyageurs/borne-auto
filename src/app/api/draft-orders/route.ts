import { NextResponse } from 'next/server';

async function findOrUpdateCustomer(customer: any) {
  try {
    // Rechercher le client par email
    const searchResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/customers/search.json?query=email:${customer.email}`,
      {
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!searchResponse.ok) {
      throw new Error('Error searching for customer');
    }

    const searchData = await searchResponse.json();
    let customerId;

    if (searchData.customers && searchData.customers.length > 0) {
      // Mettre à jour le client existant
      const existingCustomer = searchData.customers[0];
      customerId = existingCustomer.id;

      const updateResponse = await fetch(
        `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/customers/${customerId}.json`,
        {
          method: 'PUT',
          headers: {
            'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer: {
              id: customerId,
              first_name: customer.first_name,
              last_name: customer.last_name,
              email: customer.email,
              phone: customer.phone,
              accepts_marketing: customer.accepts_marketing,
              accepts_marketing_updated_at: new Date().toISOString()
            }
          })
        }
      );

      if (!updateResponse.ok) {
        throw new Error('Error updating customer');
      }

      return customerId;
    } else {
      // Créer un nouveau client
      const createResponse = await fetch(
        `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/customers.json`,
        {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer: {
              first_name: customer.first_name,
              last_name: customer.last_name,
              email: customer.email,
              phone: customer.phone,
              accepts_marketing: customer.accepts_marketing,
              accepts_marketing_updated_at: new Date().toISOString()
            }
          })
        }
      );

      if (!createResponse.ok) {
        throw new Error('Error creating customer');
      }

      const createData = await createResponse.json();
      return createData.customer.id;
    }
  } catch (error) {
    console.error('Error in findOrUpdateCustomer:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, shippingLine, customer } = body;

    console.log('Items reçus:', items);
    console.log('Méthode d\'expédition reçue:', shippingLine);
    console.log('Informations client reçues:', customer);

    // Convertir les items du panier en format Shopify
    const line_items = Object.entries(items).map(([variantId, item]: [string, any]) => {
      const numericId = variantId.split('/').pop()?.replace('ProductVariant/', '') || '';
      console.log('Conversion variantId:', { original: variantId, numericId });
      
      return {
        variant_id: numericId,
        quantity: item.quantity
      };
    });

    // Trouver ou créer le client
    const customerData = {
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      accepts_marketing: customer.acceptsMarketing
    };

    const customerId = await findOrUpdateCustomer(customerData);

    const draftOrderData = {
      draft_order: {
        line_items,
        note: "Commande créée depuis la borne automatique",
        tags: "borne-auto",
        shipping_line: shippingLine ? {
          shipping_rate_id: shippingLine.shippingRateId,
          title: shippingLine.title,
          price: shippingLine.price
        } : undefined,
        customer: {
          id: customerId
        },
        shipping_address: {
          first_name: customer.firstName,
          last_name: customer.lastName,
          address1: customer.address1,
          city: customer.city,
          zip: customer.postalCode,
          country: customer.country,
          phone: customer.phone
        }
      }
    };

    console.log('Données envoyées à Shopify:', JSON.stringify(draftOrderData, null, 2));

    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/draft_orders.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftOrderData),
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
    console.error('Error creating draft order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
