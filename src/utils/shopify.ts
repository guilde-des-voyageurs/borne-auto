export async function getProducts() {
  try {
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products.json?status=active`,
      {
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    
    // Transformer les données pour inclure le poids dans chaque variante
    const productsWithWeights = data.products.map(product => ({
      ...product,
      variants: product.variants.map(variant => ({
        ...variant,
        weight: parseFloat(variant.grams) / 1000, // Convertir les grammes en kg
        weight_unit: 'kg'
      }))
    }));

    return { products: productsWithWeights };
  } catch (error) {
    console.error('Error fetching products:', error instanceof Error ? error.message : 'Unknown error');
    return { products: [] };
  }
}