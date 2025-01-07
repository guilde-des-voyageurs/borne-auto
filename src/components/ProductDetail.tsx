'use client';

import { useState, useEffect } from 'react';

interface Variant {
  id: string;
  title: string;
  price: string;
  option1: string | null; // Couleur
  option2: string | null; // Taille
  image_id: string | null;
}

interface ProductDetailProps {
  product: {
    id: string;
    title: string;
    images: Array<{
      id: string;
      src: string;
    }>;
    variants: Variant[];
    options: Array<{
      name: string;
      values: string[];
    }>;
  };
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(product.images[0]?.src);

  // Extraire les options uniques
  const colors = Array.from(new Set(product.variants.map(v => v.option1).filter(Boolean)));
  const sizes = Array.from(new Set(product.variants.map(v => v.option2).filter(Boolean)));

  // Trouver la variante correspondante et mettre à jour l'image
  useEffect(() => {
    if (selectedColor) {
      const variantWithColor = product.variants.find(v => v.option1 === selectedColor);
      if (variantWithColor?.image_id) {
        const image = product.images.find(img => img.id === variantWithColor.image_id);
        if (image) {
          setCurrentImage(image.src);
        }
      }
    }
  }, [selectedColor, product.variants, product.images]);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      {/* Image du produit */}
      <div className="mb-8 flex justify-center items-center h-96">
        <img
          src={currentImage}
          alt={product.title}
          className="max-h-full w-auto object-contain rounded-lg"
        />
      </div>

      {/* Titre du produit */}
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
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
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
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
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-6 py-3 rounded-lg border-2 transition-all ${
                  selectedSize === size
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bouton d'ajout au panier */}
      <button
        className={`w-full py-4 rounded-lg text-white text-lg font-semibold transition-colors ${
          selectedColor && selectedSize
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
        disabled={!selectedColor || !selectedSize}
      >
        {selectedColor && selectedSize ? 'Ajouter au panier' : 'Sélectionnez une couleur et une taille'}
      </button>
    </div>
  );
}
