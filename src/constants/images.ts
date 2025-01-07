// Images par défaut générales
export const DEFAULT_PRODUCT_IMAGE = '/images/default-product.webp';
export const TSHIRT_DEFAULT_IMAGE = '/images/default-tshirt.webp';
export const SWEATSHIRT_DEFAULT_IMAGE = '/images/default-sweatshirt.webp';

// Images par défaut spécifiques aux produits
const PRODUCT_DEFAULT_IMAGES: { [key: string]: string } = {
  'Le Pommier d\'Avalon': '/images/default-pommier-avalon.webp',
  'Le Vagabond Gris': '/images/default-vagabond-gris.webp',
  'T-shirt Yggdrasil - Précommande sur stand': '/images/default-yggdrasil.webp'
};

export const getDefaultImageByType = (type: string): string => {
  switch (type) {
    case 'T-shirt unisexe':
      return TSHIRT_DEFAULT_IMAGE;
    case 'Sweatshirt':
      return SWEATSHIRT_DEFAULT_IMAGE;
    default:
      return DEFAULT_PRODUCT_IMAGE;
  }
};

export const getDefaultImageByProduct = (productTitle: string, productType: string): string => {
  // D'abord, on vérifie si on a une image spécifique pour ce produit
  if (PRODUCT_DEFAULT_IMAGES[productTitle]) {
    return PRODUCT_DEFAULT_IMAGES[productTitle];
  }
  
  // Sinon, on retourne l'image par défaut du type
  return getDefaultImageByType(productType);
};
