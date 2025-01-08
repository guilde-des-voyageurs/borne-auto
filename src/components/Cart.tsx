'use client';

import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import CartSummaryModal from './CartSummaryModal';

export default function Cart() {
  const { state, dispatch } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity < 1) {
      dispatch({ type: 'REMOVE_ITEM', payload: variantId });
      return;
    }
    dispatch({ type: 'UPDATE_QUANTITY', payload: { variantId, quantity } });
  };

  const removeItem = (variantId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: variantId });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const handleClose = () => {
    setIsOpen(false);
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

  const calculateTotalWeight = () => {
    return Object.entries(state.items).reduce((total, [_, item]) => {
      return total + (item.weight * item.quantity);
    }, 0);
  };

  return (
    <>
      {/* Bouton du panier */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <div className="relative">
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
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {Object.values(state.items).reduce((total, item) => total + item.quantity, 0)}
          </span>
        </div>
      </button>

      {/* Modal du panier */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Contenu du panier */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'tween' }}
              className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg p-6 z-50"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Panier</h2>
                <button
                  onClick={handleClose}
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

              {Object.keys(state.items).length === 0 ? (
                <div className="text-gray-500 text-center">Votre panier est vide</div>
              ) : (
                <>
                  {/* Bouton vider le panier */}
                  <div className="mb-4">
                    <button
                      onClick={clearCart}
                      className="text-sm text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Vider le panier
                    </button>
                  </div>

                  {/* Liste des produits */}
                  <div className="flex-1 overflow-y-auto mb-6">
                    {Object.entries(state.items).map(([variantId, item]) => (
                      <div
                        key={variantId}
                        className="flex items-start justify-between py-4 border-b border-gray-200"
                      >
                        <div className="flex items-start gap-4">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium">{item.title}</span>
                            <span className="text-sm text-gray-600">{item.variantTitle}</span>
                            <span className="text-sm text-gray-600">
                              {formatWeight(item.weight, item.weight_unit)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm text-blue-600 font-medium">{item.price} €</div>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => updateQuantity(variantId, item.quantity - 1)}
                                className="text-gray-500 hover:text-gray-700 transition-colors w-6 h-6 flex items-center justify-center border border-gray-300 rounded"
                              >
                                -
                              </button>
                              <span className="text-gray-800 mx-2">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(variantId, item.quantity + 1)}
                                className="text-gray-500 hover:text-gray-700 transition-colors w-6 h-6 flex items-center justify-center border border-gray-300 rounded"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(variantId)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Poids total</span>
                      <span className="font-medium text-gray-800">
                        {formatWeight(calculateTotalWeight())}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total</span>
                      <span className="font-bold text-xl text-gray-800">{state.total.toFixed(2)} €</span>
                    </div>
                    <button
                      onClick={() => setShowSummary(true)}
                      className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Valider le panier
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de résumé */}
      <CartSummaryModal isOpen={showSummary} onClose={() => setShowSummary(false)} />
    </>
  );
}
