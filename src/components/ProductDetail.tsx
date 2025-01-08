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
}

interface ProductDetailProps {
  product: any;
  onProductAdded: (info: { productTitle: string; productImage: string; variant: string }) => void;
}

export default function ProductDetail({ product, onProductAdded }: ProductDetailProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string>(
    getDefaultImageByProduct(product.title, product.product_type)
  );

  const { dispatch } = useCart();

  // Extraire les options uniques
  const colors = Array.from(new Set(product.variants.map(v => v.option1).filter(Boolean)));
  const sizes = Array.from(new Set(product.variants.map(v => v.option2).filter(Boolean)));

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
      setSelectedSize(null);
    }
  }, [selectedColor, availableSizes, selectedSize]);

  // Trouver la variante sélectionnée
  const selectedVariant = product.variants.find(
    v => v.option1 === selectedColor && v.option2 === selectedSize
  );

  // Mettre à jour l'image en fonction de la sélection
  useEffect(() => {
    if (selectedColor) {
      const variantWithColor = product.variants.find(v => v.option1 === selectedColor);
      if (variantWithColor?.image_id) {
        const image = product.images.find(img => img.id === variantWithColor.image_id);
        if (image) {
          setCurrentImage(image.src);
        }
      }
    } else {
      setCurrentImage(getDefaultImageByProduct(product.title, product.product_type));
    }
  }, [selectedColor, product.variants, product.images, product.title, product.product_type]);

  const handleAddToCart = () => {
    if (selectedVariant) {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          variantId: selectedVariant.id,
          item: {
            productId: product.id,
            title: product.title,
            variantTitle: `${selectedColor} - ${selectedSize}`,
            price: selectedVariant.price,
            quantity: 1,
            image: currentImage,
            weight: selectedVariant.weight || 0,
            weight_unit: selectedVariant.weight_unit || 'kg'
          }
        }
      });

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
      <div className="mb-8 flex justify-center items-center h-96">
        <img
          src={currentImage}
          alt={product.title}
          className="max-h-full w-auto object-contain rounded-lg"
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
