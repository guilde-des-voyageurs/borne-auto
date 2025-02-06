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

interface Product {
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
  }>;
  images: Array<{
    id: string;
    src: string;
    alt?: string;
  }>;
}

interface ShopifyResponse {
  products: ShopifyProduct[];
}

function convertShopifyProduct(shopifyProduct: ShopifyProduct): Product {
  return {
    ...shopifyProduct,
    images: shopifyProduct.images.map(img => ({
      ...img,
      id: String(img.id)
    }))
  };
}

export async function getProducts(): Promise<{ products: Product[] }> {
  try {
    console.log('Début de getProducts');
    const url = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products.json?status=active&fields=id,title,product_type,variants,images`;
    console.log('URL de requête:', url);

    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur de réponse Shopify:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data: ShopifyResponse = await response.json();
    console.log('Nombre de produits reçus:', data.products.length);
    
    // Log du premier produit pour voir sa structure
    console.log('Premier produit:', {
      title: data.products[0]?.title,
      type: data.products[0]?.product_type,
      variants: data.products[0]?.variants
    });

    // Ne pas filtrer les produits pour l'instant
    const processedProducts = data.products.map(product => ({
      ...product,
      images: product.images.length > 0 ? [product.images[0]] : []
    }));

    console.log('Types de produits disponibles:', new Set(processedProducts.map(p => p.product_type)));
    console.log('Nombre total de produits:', processedProducts.length);

    // Convertir et retourner tous les produits
    return { 
      products: processedProducts.map(product => ({
        id: product.id,
        title: product.title,
        product_type: product.product_type,
        variants: product.variants.map(v => ({
          id: v.id,
          title: v.title,
          price: v.price,
          weight: v.weight,
          weight_unit: v.weight_unit,
          available: true // Force à true pour l'instant
        })),
        images: product.images
      }))
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [] };
  }
}