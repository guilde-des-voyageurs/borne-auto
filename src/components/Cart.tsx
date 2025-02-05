'use client';

import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import CartSummaryModal from './CartSummaryModal';
import ShippingRatesModal from './ShippingRatesModal';

interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  postalCode: string;
  country: string;
  acceptsMarketing: boolean;
}

export default function Cart() {
  const { state, dispatch } = useCart();
  const [showSummary, setShowSummary] = useState(false);
  const [showShippingRates, setShowShippingRates] = useState(false);
  const [currentDraftOrderId, setCurrentDraftOrderId] = useState<string | null>(null);

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

  const formatWeight = (weight: number, unit: string = 'kg') => {
    // Convertir en kg si le poids est en grammes
    const weightInKg = unit === 'g' ? weight / 1000 : weight;
    return `${weightInKg.toFixed(2)} kg`;
  };

  const calculateTotalWeight = () => {
    return Object.entries(state.items).reduce((total, [_, item]) => {
      return total + (item.weight * item.quantity);
    }, 0);
  };

  const handleCreateDraftOrder = async (options: { customer: Customer }) => {
    try {
      const response = await fetch('/api/draft-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: state.items,
          customer: options.customer
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create draft order');
      }

      const data = await response.json();
      console.log('Draft order created:', data);
      
      // Extraire l'ID de la commande provisoire
      const draftOrderId = data.draft_order.id.toString();
      console.log('Draft order ID:', draftOrderId);
      
      setCurrentDraftOrderId(draftOrderId);
      dispatch({ type: 'CLEAR_CART' });
      setShowSummary(false);
      setShowShippingRates(true);
    } catch (error) {
      console.error('Error creating draft order:', error);
      throw error;
    }
  };

  return (
    <>
      {/* Panier */}
      <AnimatePresence mode="wait">
        {Object.keys(state.items).length > 0 ? (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "24rem", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border-l shadow-lg overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Panier</h2>
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                Vider le panier
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-4">
                {Object.entries(state.items).map(([variantId, item]) => (
                  <div
                    key={variantId}
                    className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.variantTitle}</p>
                      <p className="text-sm text-gray-600">
                        Prix unitaire : {item.price} €
                      </p>
                      <p className="text-sm text-gray-600">
                        Poids unitaire : {formatWeight(item.weight, item.weight_unit)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(variantId, item.quantity - 1)}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(variantId, item.quantity + 1)}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(variantId)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {(parseFloat(item.price) * item.quantity).toFixed(2)} €
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatWeight(item.weight * item.quantity, item.weight_unit)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t p-4">
              <div className="mb-2 flex justify-between">
                <span>Poids total</span>
                <span>{formatWeight(calculateTotalWeight())}</span>
              </div>
              <div className="mb-4 flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold text-xl">{state.total.toFixed(2)} €</span>
              </div>
              <button
                onClick={() => setShowSummary(true)}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Valider le panier
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showSummary && (
          <CartSummaryModal
            isOpen={showSummary}
            onClose={() => setShowSummary(false)}
            state={state}
            onCreateDraftOrder={handleCreateDraftOrder}
          />
        )}
      </AnimatePresence>

      {/* Modal des méthodes d'expédition */}
      {currentDraftOrderId && (
        <ShippingRatesModal
          isOpen={showShippingRates}
          onClose={() => setShowShippingRates(false)}
          draftOrderId={currentDraftOrderId}
        />
      )}
    </>
  );
}
