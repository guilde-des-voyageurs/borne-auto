interface ShopifyProduct {
  id: string;
  title: string;
  product_type: string;
  variants: Array<{
    id: string;
    title: string;
    price: string;
    weight: number;
    weight_unit: string;
    available: boolean;
    grams: number;
    image_id: number;
  }>;
  images: Array<{
    src: string;
    alt?: string;
    id: number;
  }>;
}

interface ShopifyResponse {
  products: ShopifyProduct[];
}

export async function getProducts(): Promise<{ products: ShopifyProduct[] }> {
  try {
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products.json?status=active&fields=id,title,product_type,variants,images`,
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

    const data: ShopifyResponse = await response.json();
    
    // Fonction pour trouver l'image "black/noir" ou la première image disponible
    const findPreferredImage = (images: ShopifyProduct['images']) => {
      // Chercher d'abord une image avec "black" ou "noir" dans l'URL
      const blackImage = images.find(img => {
        const url = img.src.toLowerCase();
        return url.includes('black') || url.includes('noir');
      });
      // Si aucune image "black/noir" n'est trouvée, retourner la première image ou null
      return blackImage?.src || images[0]?.src || null;
    };
    
    // Transformer les données pour inclure le poids et les images dans chaque produit
    const productsWithWeights = data.products.map(product => ({
      ...product,
      // Utiliser l'image "black/noir" ou la première image disponible pour l'image principale
      image: findPreferredImage(product.images || []),
      variants: product.variants.map(variant => ({
        ...variant,
        weight: parseFloat(variant.grams) / 1000, // Convertir les grammes en kg
        weight_unit: 'kg',
        // Chercher d'abord l'image spécifique à la variante
        image: product.images?.find(img => img.id === variant.image_id)?.src || findPreferredImage(product.images || [])
      }))
    }));

    return { products: productsWithWeights };
  } catch (error) {
    console.error('Error fetching products:', error instanceof Error ? error.message : 'Unknown error');
    return { products: [] };
  }
}