'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductDetail from './ProductDetail';
import SuccessSlide from './SuccessSlide';
import { getDefaultImageByType, getDefaultImageByProduct } from '../constants/images';

type Slide = 'types' | 'products' | 'variants' | 'success';

interface SuccessInfo {
  productTitle: string;
  productImage: string;
  variant: string;
}

interface SalesTunnelProps {
  products: any[];
}

export default function SalesTunnel({ products }: SalesTunnelProps) {
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<Slide>('types');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleProductAdded = (info: SuccessInfo) => {
    setSuccessInfo(info);
    setCurrentSlide('success');
    
    // Retourner à la première slide après 2 secondes
    setTimeout(() => {
      setCurrentSlide('types');
      setSelectedType(null);
      setSelectedProduct(null);
      setSuccessInfo(null);
    }, 2000);
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

  if (!mounted) {
    return null;
  }

  return (
    <div className="container mx-auto p-8">
      {currentSlide !== 'types' && currentSlide !== 'success' && (
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
                className="p-6 bg-[#555] border border-gray-600 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-white"
              >
                <div className="flex flex-col items-center">
                  <img
                    src={getDefaultImageByType(type)}
                    alt={type}
                    className="w-48 h-48 object-contain mb-4"
                  />
                  <h2 className="text-xl font-semibold">{type || 'Sans catégorie'}</h2>
                </div>
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
                  className="bg-[#555] border border-gray-600 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow text-left text-white"
                >
                  <img
                    src={getDefaultImageByProduct(product.title, product.product_type)}
                    alt={product.title}
                    className="w-full h-48 object-contain rounded-md mb-4"
                  />
                  <h2 className="text-xl font-semibold">{product.title}</h2>
                  <p className="text-gray-300 mt-2">{product.variants[0].price} €</p>
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
          >
            <ProductDetail 
              product={selectedProduct} 
              onProductAdded={handleProductAdded}
            />
          </motion.div>
        )}

        {currentSlide === 'success' && successInfo && (
          <motion.div
            key="success"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <SuccessSlide {...successInfo} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
