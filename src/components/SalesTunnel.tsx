'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  product_type: string;
  variants: Variant[];
  images: Image[];
}

interface Variant {
  id: string;
  title: string;
  price: string;
  weight: number;
  weight_unit: string;
  available: boolean;
}

interface Image {
  id: string;
  src: string;
  alt?: string;
}

interface SalesTunnelProps {
  products: Product[];
}

export default function SalesTunnel({ products }: SalesTunnelProps) {
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<'types' | 'products' | 'variants' | 'success'>('types');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ productTitle: string; productImage: string; variant: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const excludedTypes = ['Sweatshirt Drummer'];

  const productTypes = Array.from(new Set(
    products
      .map(product => product.product_type)
      .filter(type => !excludedTypes.includes(type))
  ));

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setCurrentSlide('products');
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCurrentSlide('variants');
  };

  const handleProductAdded = (info: { productTitle: string; productImage: string; variant: string }) => {
    setSuccessInfo(info);
    setCurrentSlide('success');

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
    <div className={`mx-auto p-8 transition-all duration-300`}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productTypes.map((type) => (
                <motion.div
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTypeSelect(type)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <Image
                      src={`/images/${type.toLowerCase()}.jpg`}
                      alt={type}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-center">{type}</h3>
                  </div>
                </motion.div>
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
              <h1 className="text-4xl font-bold text-white mb-4">C&apos;est noté ✨</h1>
              <p className="text-2xl text-white">On part sur quel motif du coup ?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleProductSelect(product)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <Image
                      src={product.images && product.images.length > 0 ? product.images[0].src : `/images/${product.product_type.toLowerCase()}.jpg`}
                      alt={product.title}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-center">{product.title}</h3>
                  </div>
                </motion.div>
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
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">Sélectionnez une variante</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedProduct.variants.map((variant) => (
                <motion.div
                  key={variant.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleProductAdded({ productTitle: selectedProduct.title, productImage: selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images[0].src : `/images/${selectedProduct.product_type.toLowerCase()}.jpg`, variant: variant.title })}
                  className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
                >
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-center">{variant.title}</h3>
                    <p className="text-gray-500">{variant.price} €</p>
                  </div>
                </motion.div>
              ))}
            </div>
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
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">Produit ajouté avec succès !</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <Image
                    src={successInfo.productImage}
                    alt={successInfo.productTitle}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-center">{successInfo.productTitle}</h3>
                  <p className="text-gray-500">{successInfo.variant}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
