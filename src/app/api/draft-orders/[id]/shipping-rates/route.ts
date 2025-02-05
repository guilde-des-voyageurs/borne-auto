import { NextRequest, NextResponse } from 'next/server';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  try {
    console.log('Starting to fetch shipping rates...');

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

    // 1. D'abord récupérer la commande provisoire pour avoir le poids et l'adresse
    const draftOrderUrl = new URL(`https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/draft_orders/${params.id}.json`);
    console.log('Fetching draft order from URL:', draftOrderUrl.toString());

    const draftOrderResponse = await fetch(draftOrderUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
      }
    });

    if (!draftOrderResponse.ok) {
      const errorText = await draftOrderResponse.text();
      console.error('Error fetching draft order:', errorText);
      return NextResponse.json({ 
        error: 'Failed to fetch draft order', 
        details: errorText 
      }, { status: draftOrderResponse.status });
    }

    const draftOrderData = await draftOrderResponse.json();
    console.log('Draft order data:', JSON.stringify(draftOrderData, null, 2));

    // Vérifier si l'adresse de livraison existe
    if (!draftOrderData.draft_order.shipping_address) {
      return NextResponse.json({ 
        error: 'Missing shipping address', 
        details: 'The draft order must have a shipping address to calculate shipping rates' 
      }, { status: 400 });
    }

    // Calculer le poids total en KG (convertir depuis les grammes)
    const totalWeightKg = draftOrderData.draft_order.line_items.reduce(
      (total: number, item: any) => total + (item.grams || 0) * item.quantity,
      0
    ) / 1000; // Convertir en kg
    const shippingAddress = draftOrderData.draft_order.shipping_address;

    console.log('Order total weight (kg):', totalWeightKg);
    console.log('Shipping address:', shippingAddress);

    // 2. Récupérer les zones d'expédition
    const shippingZonesUrl = new URL(`https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/shipping_zones.json`);
    console.log('Fetching shipping zones from URL:', shippingZonesUrl.toString());

    const shippingZonesResponse = await fetch(shippingZonesUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
      }
    });

    if (!shippingZonesResponse.ok) {
      const errorText = await shippingZonesResponse.text();
      console.error('Error fetching shipping zones:', errorText);
      return NextResponse.json({ 
        error: 'Failed to fetch shipping zones', 
        details: errorText 
      }, { status: shippingZonesResponse.status });
    }

    const shippingZonesData = await shippingZonesResponse.json();
    console.log('Shipping zones data:', JSON.stringify(shippingZonesData, null, 2));

    // 3. Trouver les zones qui correspondent au pays de livraison
    const matchingZones = shippingZonesData.shipping_zones.filter(zone => {
      // Vérifier si la zone contient le pays de livraison
      const hasMatchingCountry = zone.countries.some((country: any) => {
        const countryMatch = country.code === shippingAddress.country_code;
        const provinceMatch = !country.provinces.length || 
          country.provinces.some((province: any) => province.code === shippingAddress.province_code);
        return countryMatch && provinceMatch;
      });

      return hasMatchingCountry;
    });

    console.log('Matching zones:', JSON.stringify(matchingZones, null, 2));

    // 4. Extraire et filtrer les méthodes d'expédition des zones correspondantes
    const shippingRates = matchingZones.flatMap(zone => {
      const rates = [];

      // Ajouter uniquement les méthodes basées sur le poids si le poids total est dans la plage
      if (zone.weight_based_shipping_rates) {
        rates.push(...zone.weight_based_shipping_rates
          .filter(rate => {
            // Les poids dans l'API sont en kg
            const minOk = !rate.weight_low || totalWeightKg >= parseFloat(rate.weight_low);
            const maxOk = !rate.weight_high || totalWeightKg <= parseFloat(rate.weight_high);
            
            console.log('Checking weight range for rate:', rate.name);
            console.log('Weight range:', rate.weight_low, 'kg -', rate.weight_high, 'kg');
            console.log('Cart weight:', totalWeightKg, 'kg');
            console.log('Weight in range:', minOk && maxOk);
            
            return minOk && maxOk;
          })
          .map(rate => ({
            id: rate.id.toString(),
            name: rate.name,
            price: rate.price,
            service_code: `WEIGHT_${rate.id}`,
            weight_low: rate.weight_low,
            weight_high: rate.weight_high
          }))
        );
      }

      return rates;
    });

    // 5. Vérifier quelle méthode est actuellement sélectionnée
    const selectedShippingLine = draftOrderData.draft_order.shipping_line;

    // 6. Formater la réponse
    const formattedData = {
      order_details: {
        weight_kg: totalWeightKg,
        shipping_address: {
          country: shippingAddress.country,
          country_code: shippingAddress.country_code,
          province: shippingAddress.province,
          province_code: shippingAddress.province_code,
          city: shippingAddress.city,
          zip: shippingAddress.zip
        }
      },
      shipping_rates: shippingRates.map(rate => ({
        ...rate,
        selected: selectedShippingLine && (
          selectedShippingLine.code === rate.service_code || 
          selectedShippingLine.id?.toString() === rate.id
        )
      }))
    };

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error('Error getting shipping rates:', error);
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
