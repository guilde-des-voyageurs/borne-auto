'use client';

import { motion } from 'framer-motion';

interface ShippingMethod {
  id: string;
  title: string;
  price: string;
  estimated_days: string;
}

interface ShippingMethodSlideProps {
  shippingMethods: ShippingMethod[];
  onNext: (methodId: string) => void;
  onBack: () => void;
}

export default function ShippingMethodSlide({ shippingMethods, onNext, onBack }: ShippingMethodSlideProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto p-8"
    >
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Mode de livraison</h2>
      
      <div className="space-y-4 mb-8">
        {shippingMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => onNext(method.id)}
            className="w-full p-6 bg-gray-700 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors text-left group"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {method.title}
                </h3>
                <p className="text-gray-400 mt-1">
                  Délai estimé : {method.estimated_days}
                </p>
              </div>
              <div className="text-2xl font-bold text-white">
                {method.price} €
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="w-full py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold text-lg"
      >
        Retour
      </button>
    </motion.div>
  );
}
