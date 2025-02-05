import { NextResponse } from 'next/server';
import { createShopifyClient } from '@/utils/shopifyAdmin';

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  postalCode: string;
  country: string;
}

interface ShippingLine {
  title: string;
  price: string;
}

interface DiscountLine {
  title: string;
  amount: string;
}

interface DraftOrderInput {
  lineItems: Array<{
    variantId: string;
    quantity: number;
  }>;
  email: string;
  shippingLine: {
    title: string;
    price: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    zip: string;
    country: string;
    phone: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    zip: string;
    country: string;
    phone: string;
  };
  appliedDiscount?: {
    title: string;
    value: string;
    valueType: 'FIXED_AMOUNT';
    description: string;
  };
}

interface ShopifyResponse {
  draftOrderCreate: {
    draftOrder: {
      id: string;
      order?: {
        id: string;
      };
    };
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

export async function POST(request: Request) {
  try {
    const { items, shippingLine, discountLine, customer } = await request.json() as {
      items: Record<string, { quantity: number }>;
      shippingLine: ShippingLine;
      discountLine?: DiscountLine;
      customer: CustomerInfo;
    };
    
    console.log('Creating draft order with:', { items, shippingLine, discountLine, customer });

    const shopify = createShopifyClient();

    // Convertir les items du panier en ligne de commande Shopify
    const lineItems = Object.entries(items).map(([variantId, item]) => {
      const numericId = variantId.split('/').pop()?.replace('ProductVariant/', '') || '';
      console.log('Converting variant:', { original: variantId, numeric: numericId });
      
      return {
        variantId: `gid://shopify/ProductVariant/${numericId}`,
        quantity: item.quantity
      };
    });

    console.log('Prepared line items:', lineItems);

    // Préparer la mutation GraphQL
    const mutation = `
      mutation draftOrderCreate($input: DraftOrderInput!) {
        draftOrderCreate(input: $input) {
          draftOrder {
            id
            order {
              id
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // Construire les données de la commande
    const draftOrderInput: DraftOrderInput = {
      lineItems,
      email: customer.email,
      shippingLine: {
        title: shippingLine.title,
        price: shippingLine.price
      },
      billingAddress: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        address1: customer.address1,
        city: customer.city,
        zip: customer.postalCode,
        country: customer.country,
        phone: customer.phone
      },
      shippingAddress: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        address1: customer.address1,
        city: customer.city,
        zip: customer.postalCode,
        country: customer.country,
        phone: customer.phone
      }
    };

    // Ajouter la réduction si elle existe
    if (discountLine) {
      draftOrderInput.appliedDiscount = {
        title: discountLine.title,
        value: discountLine.amount,
        valueType: 'FIXED_AMOUNT',
        description: 'Réduction sur les frais de port'
      };
    }

    console.log('Sending to Shopify:', {
      mutation,
      input: JSON.stringify(draftOrderInput, null, 2)
    });

    // Envoyer la requête à Shopify
    const response = await shopify.request<ShopifyResponse>(mutation, {
      input: draftOrderInput
    });

    console.log('Shopify response:', response);

    if (response.draftOrderCreate?.userErrors?.length > 0) {
      const errors = response.draftOrderCreate.userErrors;
      console.error('Shopify draft order errors:', errors);
      return NextResponse.json({ error: errors[0].message }, { status: 400 });
    }

    return NextResponse.json({
      draft_order: response.draftOrderCreate?.draftOrder
    });

  } catch (error) {
    console.error('Error in draft-orders API:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      details: error instanceof Error ? (error as any).response?.errors : undefined
    });
    
    // Si c'est une erreur GraphQL, on retourne les détails
    if (error instanceof Error && (error as any).response?.errors) {
      const graphqlErrors = (error as any).response.errors;
      return NextResponse.json(
        { error: graphqlErrors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
