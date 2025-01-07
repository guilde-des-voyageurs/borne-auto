'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Slide = 'types' | 'products' | 'variants';

interface SalesTunnelProps {
  products: any[];
}

export default function SalesTunnel({ products }: SalesTunnelProps) {
  const [currentSlide, setCurrentSlide] = useState<Slide>('types');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Extraire les types uniques des produits
  const productTypes = Array.from(new Set(products.map(product => product.product_type)));

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setCurrentSlide('products');
  };

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setCurrentSlide('variants');
  };

  const handleBack = () => {
    switch (currentSlide) {
      case 'products':
        setCurrentSlide('types');
        setSelectedType(null);
        break;
      case 'variants':
        setCurrentSlide('products');
        setSelectedProduct(null);
        break;
    }
  };

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <div className="container mx-auto p-8">
      {currentSlide !== 'types' && (
        <button
          onClick={handleBack}
          className="fixed top-8 left-8 z-50 px-6 py-3 bg-white shadow-lg rounded-lg hover:bg-gray-100 transition-colors"
        >
          ← Retour
        </button>
      )}

      <AnimatePresence mode="wait">
        {currentSlide === 'types' && (
          <motion.div
            key="types"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {productTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeSelect(type)}
                className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-800">{type || 'Sans catégorie'}</h2>
              </button>
            ))}
          </motion.div>
        )}

        {currentSlide === 'products' && selectedType && (
          <motion.div
            key="products"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {products
              .filter(product => product.product_type === selectedType)
              .map(product => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow text-left"
                >
                  {product.images[0] && (
                    <img
                      src={product.images[0].src}
                      alt={product.title}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  <h2 className="text-xl font-semibold text-gray-800">{product.title}</h2>
                  <p className="text-gray-600 mt-2">{product.variants[0].price} €</p>
                </button>
              ))}
          </motion.div>
        )}

        {currentSlide === 'variants' && selectedProduct && (
          <motion.div
            key="variants"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {selectedProduct.variants.map((variant: any) => (
              <div
                key={variant.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg"
              >
                <h2 className="text-xl font-semibold text-gray-800">{variant.title}</h2>
                <p className="text-gray-600 mt-2">{variant.price} €</p>
                <button
                  className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sélectionner
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
