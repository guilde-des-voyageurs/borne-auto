'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { createDraftOrder } from '../utils/shopifyDraft';

interface CartSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSummaryModal({ isOpen, onClose }: CartSummaryModalProps) {
  const { state, dispatch } = useCart();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTotalWeight = () => {
    return Object.entries(state.items).reduce((total, [_, item]) => {
      return total + (item.weight * item.quantity);
    }, 0);
  };

  const formatWeight = (weight: number, unit: string = 'g') => {
    if (unit === 'kg') {
      return `${weight.toFixed(2)} kg`;
    }
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(2)} kg`;
    }
    return `${weight} g`;
  };

  const handleCreateDraftOrder = async () => {
    setIsCreatingOrder(true);
    setError(null);
    
    try {
      await createDraftOrder(state.items);
      dispatch({ type: 'CLEAR_CART' });
      onClose();
    } catch (err) {
      setError('Erreur lors de la création de la commande. Veuillez réessayer.');
      console.error('Error creating draft order:', err);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-lg shadow-xl z-50 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Résumé de votre panier</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(state.items).map(([variantId, item]) => (
                <div
                  key={variantId}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-start gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.variantTitle}</p>
                      <p className="text-sm text-gray-600">
                        Quantité : {item.quantity} × {item.price} €
                      </p>
                      <p className="text-sm text-gray-600">
                        Poids unitaire : {formatWeight(item.weight, item.weight_unit)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">
                      {(parseFloat(item.price) * item.quantity).toFixed(2)} €
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatWeight(item.weight * item.quantity, item.weight_unit)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Poids total</span>
                <span className="font-medium text-gray-800">
                  {formatWeight(calculateTotalWeight())}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total</span>
                <span className="font-bold text-xl text-gray-800">
                  {state.total.toFixed(2)} €
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                onClick={handleCreateDraftOrder}
                disabled={isCreatingOrder}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingOrder ? 'Création en cours...' : 'Créer une commande provisoire'}
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
