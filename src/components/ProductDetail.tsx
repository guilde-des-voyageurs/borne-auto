'use client';

import { useState, useEffect, useMemo } from 'react';
import { getDefaultImageByProduct } from '../constants/images';
import { useCart } from '../context/CartContext';
import Image from 'next/image';

interface ProductVariant {
  id: string;
  title: string;
  price: string;
  weight: number;
  weight_unit: string;
  available: boolean;
}

interface ProductImage {
  src: string;
  alt?: string;
}

interface Product {
  id: string;
  title: string;
  variants: ProductVariant[];
  images: ProductImage[];
}

interface ProductDetailProps {
  product: Product;
  onProductAdded: (info: { productTitle: string; productImage: string; variant: string }) => void;
}

// Fonction utilitaire pour précharger une image
const preloadImage = (src: string) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(src);
    image.onerror = reject;
    image.src = src;
  });
};

export default function ProductDetail({ product, onProductAdded }: ProductDetailProps) {
  // Extraire les options uniques
  const colors = Array.from(new Set(product.variants.map(v => v.title).filter(Boolean)));
  const sizes = Array.from(new Set(product.variants.map(v => v.weight_unit).filter(Boolean)));

  // Initialiser avec la première couleur et la taille M si disponible
  const [selectedColor, setSelectedColor] = useState<string | null>(() => colors[0] || null);
  const [selectedSize, setSelectedSize] = useState<string | null>(() => {
    // Si la taille M est disponible pour la première couleur, la sélectionner
    const mSizeAvailable = product.variants.some(v => v.title === colors[0] && v.weight_unit === 'M');
    if (mSizeAvailable) {
      return 'M';
    }
    // Sinon, prendre la première taille disponible pour cette couleur
    const firstAvailableSize = product.variants.find(v => v.title === colors[0])?.weight_unit;
    return firstAvailableSize || null;
  });

  const [currentImage, setCurrentImage] = useState<string>(
    getDefaultImageByProduct(product.title, product.title)
  );
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

  const { dispatch } = useCart();

  // Précharger toutes les images des variantes au montage du composant
  useEffect(() => {
    const loadAllImages = async () => {
      const imagesToLoad = product.images
        .map((img: ProductImage) => img.src)
        .filter((img: string): img is string => Boolean(img));

      // Ajouter l'image par défaut
      const defaultImage = getDefaultImageByProduct(product.title, product.title);
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
        .filter(v => v.title === selectedColor)
        .map(v => v.weight_unit)
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
  const selectedVariantId = product.variants.find(
    (variant) => variant.title === selectedColor && variant.weight_unit === selectedSize
  )?.id;

  // Mettre à jour l'image en fonction de la sélection
  useEffect(() => {
    if (selectedVariantId) {
      setIsImageLoading(true);
      const newImage = product.images.find((img) => img.src === selectedVariantId)?.src || getDefaultImageByProduct(product.title, product.title);
      
      if (preloadedImages.has(newImage)) {
        setCurrentImage(newImage);
        setIsImageLoading(false);
      } else {
        const img = new Image();
        img.src = newImage;
        img.onload = () => {
          setCurrentImage(newImage);
          setIsImageLoading(false);
          setPreloadedImages(prev => {
            const newSet = new Set(prev);
            newSet.add(newImage);
            return newSet;
          });
        };
      }
    }
  }, [selectedVariantId, product.title, product.images, preloadedImages]);

  const handleAddToCart = () => {
    if (selectedVariantId) {
      console.log('Variant sélectionnée:', selectedVariantId);
      
      const variantId = selectedVariantId;
      
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          variantId,
          title: product.title,
          variantTitle: `${selectedColor} - ${selectedSize}`,
          price: product.variants.find(v => v.id === selectedVariantId)?.price,
          image: currentImage,
          quantity: 1,
          weight: product.variants.find(v => v.id === selectedVariantId)?.weight,
          weight_unit: product.variants.find(v => v.id === selectedVariantId)?.weight_unit
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
        <Image
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
