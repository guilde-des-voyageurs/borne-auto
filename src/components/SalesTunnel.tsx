'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductDetail from './ProductDetail';
import SuccessSlide from './SuccessSlide';
import { getDefaultImageByType } from '../constants/images';
import { useCart } from '../context/CartContext';
import { usePathname } from 'next/navigation';

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
  const { state } = useCart();
  const pathname = usePathname();

  // Vérifier si le panier doit être affiché (page d'accueil et non vide)
  const isCartVisible = pathname === '/' && Object.keys(state.items).length > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Liste des catégories à exclure
  const excludedTypes = ['Sweatshirt Drummer'];

  // Extraire les types uniques des produits en excluant les types non désirés
  const productTypes = Array.from(new Set(
    products
      .map(product => product.product_type)
      .filter(type => !excludedTypes.includes(type))
  ));

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

  const filteredProducts = selectedType
    ? products.filter(product => product.product_type === selectedType)
    : [];

  return (
    <div className={`mx-auto p-8 transition-all duration-300 ${isCartVisible ? 'pr-96' : ''}`}>
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
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">Bonjour 👋</h1>
              <p className="text-2xl text-white">Quelle base souhaitez-vous ?</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productTypes.map((type) => (
                <div
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className="relative flex flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-sm hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                >
                  <div className="aspect-h-1 aspect-w-1 bg-gray-800">
                    <img
                      src={getDefaultImageByType(type)}
                      alt={type}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex flex-1 flex-col space-y-2 p-4">
                    <h3 className="text-sm font-medium text-white">
                      {type}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {currentSlide === 'products' && (
          <motion.div
            key="products"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">C'est noté ✨</h1>
              <p className="text-2xl text-white">On part sur quel motif du coup ?</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="relative flex flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-sm hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                >
                  <div className="aspect-h-1 aspect-w-1 bg-gray-800">
                    <img
                      src={product.image || getDefaultImageByType(product.product_type)}
                      alt={product.title}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex flex-1 flex-col space-y-2 p-4">
                    <h3 className="text-sm font-medium text-white">
                      {product.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
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
            <SuccessSlide
              title={successInfo.productTitle}
              image={successInfo.productImage}
              variant={successInfo.variant}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
