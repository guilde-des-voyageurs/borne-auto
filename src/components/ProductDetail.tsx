'use client';

import { useState, useEffect, useMemo } from 'react';
import { getDefaultImageByProduct } from '../constants/images';
import { useCart } from '../context/CartContext';

interface Variant {
  id: string;
  title: string;
  price: string;
  option1: string | null; // Couleur
  option2: string | null; // Taille
  image_id: string | null;
  weight: number | null;
  weight_unit: string | null;
  admin_graphql_api_id: string | null;
  image: string | null;
}

interface ProductDetailProps {
  product: any;
  onProductAdded: (info: { productTitle: string; productImage: string; variant: string }) => void;
}

// Fonction utilitaire pour précharger une image
const preloadImage = (src: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
};

export default function ProductDetail({ product, onProductAdded }: ProductDetailProps) {
  // Extraire les options uniques
  const colors = Array.from(new Set(product.variants.map(v => v.option1).filter(Boolean)));
  const sizes = Array.from(new Set(product.variants.map(v => v.option2).filter(Boolean)));

  // Initialiser avec la première couleur et la taille M si disponible
  const [selectedColor, setSelectedColor] = useState<string | null>(() => colors[0] || null);
  const [selectedSize, setSelectedSize] = useState<string | null>(() => {
    // Si la taille M est disponible pour la première couleur, la sélectionner
    const mSizeAvailable = product.variants.some(v => v.option1 === colors[0] && v.option2 === 'M');
    if (mSizeAvailable) {
      return 'M';
    }
    // Sinon, prendre la première taille disponible pour cette couleur
    const firstAvailableSize = product.variants.find(v => v.option1 === colors[0])?.option2;
    return firstAvailableSize || null;
  });

  const [currentImage, setCurrentImage] = useState<string>(
    getDefaultImageByProduct(product.title, product.product_type)
  );
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

  const { dispatch } = useCart();

  // Précharger toutes les images des variantes au montage du composant
  useEffect(() => {
    const loadAllImages = async () => {
      const imagesToLoad = product.variants
        .map((v: Variant) => v.image)
        .filter((img: string | null): img is string => Boolean(img));

      // Ajouter l'image par défaut
      const defaultImage = getDefaultImageByProduct(product.title, product.product_type);
      if (defaultImage) {
        imagesToLoad.push(defaultImage);
      }

      // Précharger toutes les images uniques
      const uniqueImages = Array.from(new Set(imagesToLoad));
      try {
        await Promise.all(uniqueImages.map(preloadImage));
        setPreloadedImages(new Set(uniqueImages));
      } catch (error) {
        console.error('Erreur lors du préchargement des images:', error);
      }
    };

    loadAllImages();
  }, [product]);

  // Calculer les tailles disponibles pour la couleur sélectionnée
  const availableSizes = useMemo(() => {
    if (!selectedColor) return new Set(sizes);
    
    return new Set(
      product.variants
        .filter(v => v.option1 === selectedColor)
        .map(v => v.option2)
        .filter(Boolean)
    );
  }, [selectedColor, product.variants, sizes]);

  // Réinitialiser la taille si elle n'est plus disponible avec la nouvelle couleur
  useEffect(() => {
    if (selectedSize && !availableSizes.has(selectedSize)) {
      // Essayer de sélectionner la taille M si disponible
      if (availableSizes.has('M')) {
        setSelectedSize('M');
      } else {
        // Sinon prendre la première taille disponible
        const firstSize = Array.from(availableSizes)[0];
        setSelectedSize(firstSize || null);
      }
    }
  }, [selectedColor, availableSizes, selectedSize]);

  // Trouver la variante sélectionnée
  const selectedVariant = product.variants.find(
    v => v.option1 === selectedColor && v.option2 === selectedSize
  );

  // Mettre à jour l'image en fonction de la sélection
  useEffect(() => {
    if (selectedVariant) {
      setIsImageLoading(true);
      const newImage = selectedVariant.image || getDefaultImageByProduct(product.title, product.product_type);
      
      if (preloadedImages.has(newImage)) {
        setCurrentImage(newImage);
        setIsImageLoading(false);
      } else {
        preloadImage(newImage)
          .then(() => {
            setCurrentImage(newImage);
            setPreloadedImages(prev => new Set([...prev, newImage]));
          })
          .finally(() => {
            setIsImageLoading(false);
          });
      }
    }
  }, [selectedVariant, product.title, product.product_type, preloadedImages]);

  const handleAddToCart = () => {
    if (selectedVariant) {
      console.log('Variant sélectionnée:', selectedVariant);
      
      const variantId = selectedVariant.admin_graphql_api_id || `gid://shopify/ProductVariant/${selectedVariant.id}`;
      const productId = product.admin_graphql_api_id || `gid://shopify/Product/${product.id}`;
      
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          variantId,
          title: product.title,
          variantTitle: `${selectedColor} - ${selectedSize}`,
          price: selectedVariant.price,
          image: currentImage,
          quantity: 1,
          weight: selectedVariant.weight || 0,
          weight_unit: selectedVariant.weight_unit || 'kg'
        }
      });

      // Log pour déboguer
      console.log('Image envoyée à SuccessSlide:', currentImage);

      onProductAdded({
        productTitle: product.title,
        productImage: currentImage,
        variant: `${selectedColor} - ${selectedSize}`
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-[#555] rounded-lg shadow-lg p-8 text-white">
      {/* Image du produit */}
      <div className="relative mb-8 flex justify-center items-center h-96">
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={currentImage}
          alt={product.title}
          className={`max-h-full w-auto object-contain rounded-lg transition-opacity duration-300 ${
            isImageLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>

      {/* Titre du produit */}
      <h2 className="text-3xl font-bold text-center mb-8">
        {product.title}
      </h2>

      {/* Sélection des couleurs */}
      {colors.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Couleurs disponibles</h3>
          <div className="flex flex-wrap gap-4">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-6 py-3 rounded-lg border-2 transition-all ${
                  selectedColor === color
                    ? 'border-blue-400 bg-blue-900'
                    : 'border-gray-400 hover:border-blue-400'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sélection des tailles */}
      {sizes.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Tailles disponibles</h3>
          <div className="flex flex-wrap gap-4">
            {sizes.map((size) => {
              const isAvailable = availableSizes.has(size);
              return (
                <button
                  key={size}
                  onClick={() => isAvailable && setSelectedSize(size)}
                  disabled={!isAvailable}
                  className={`px-6 py-3 rounded-lg border-2 transition-all ${
                    selectedSize === size
                      ? 'border-blue-400 bg-blue-900'
                      : isAvailable
                      ? 'border-gray-400 hover:border-blue-400'
                      : 'border-gray-600 bg-gray-700 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bouton d'ajout au panier */}
      <button
        className={`w-full py-4 rounded-lg text-white text-lg font-semibold transition-colors ${
          selectedColor && selectedSize
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-600 cursor-not-allowed'
        }`}
        disabled={!selectedColor || !selectedSize}
        onClick={handleAddToCart}
      >
        {selectedColor && selectedSize ? 'Ajouter au panier' : 'Sélectionnez une couleur et une taille'}
      </button>
    </div>
  );
}
