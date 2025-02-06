'use client';

import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import CartSummaryModal from './CartSummaryModal';
import ShippingRatesModal from './ShippingRatesModal';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  // Ne montrer le panier que sur la page d'accueil et s'il n'est pas vide
  if (pathname !== '/' || Object.keys(state.items).length === 0) {
    return null;
  }

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

  const calculateTotalItems = () => {
    return Object.values(state.items).reduce((total, item) => total + item.quantity, 0);
  };

  const getDiscountPercentage = (totalItems: number) => {
    if (totalItems >= 4) return 15;
    if (totalItems >= 3) return 10;
    if (totalItems >= 2) return 5;
    return 0;
  };

  const calculateSubtotal = () => {
    return Object.values(state.items).reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    const discountPercentage = getDiscountPercentage(calculateTotalItems());
    return (subtotal * discountPercentage) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return subtotal - discount;
  };

  const handleCreateDraftOrder = async (options: { customer: Customer }) => {
    try {
      const line_items = Object.entries(state.items).map(([variantId, item]) => {
        const extractedVariantId = variantId.split('/').pop() || '';
        console.log('Processing variant:', {
          original: variantId,
          extracted: extractedVariantId
        });
        
        return {
          variant_id: extractedVariantId,
          quantity: item.quantity
        };
      });

      console.log('Sending line_items:', line_items);

      const discountPercentage = getDiscountPercentage(calculateTotalItems());
      const discountData = discountPercentage > 0 ? {
        applied_discount: {
          description: `Remise ${discountPercentage}% sur le panier`,
          value_type: 'percentage',
          value: discountPercentage.toString(),
          amount: calculateDiscount().toFixed(2),
          title: `Remise ${discountPercentage}%`
        }
      } : {};

      const response = await fetch('/api/draft-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          line_items,
          customer: options.customer,
          ...discountData
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API error:', error);
        throw new Error(error.message || 'Failed to create draft order');
      }

      const data = await response.json();
      
      dispatch({ type: 'CLEAR_CART' });
      
      const firstName = encodeURIComponent(options.customer.firstName);
      window.location.href = `/draft-order-created/${data.draft_order.id}?name=${firstName}`;
      
    } catch (error) {
      console.error('Error creating draft order:', error);
      throw error;
    }
  };

  return (
    <>
      {/* Panier */}
      <AnimatePresence mode="wait">
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
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        -
                      </button>
                      <span className="px-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(variantId, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(variantId)}
                        className="ml-2 text-red-600 hover:text-red-800 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t space-y-4">
            {/* Informations sur les promotions */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Promotions en cours :</h3>
              <ul className="text-sm space-y-1 text-blue-700">
                <li className="flex items-center">
                  <span className={calculateTotalItems() >= 2 ? "text-green-600 font-medium" : ""}>
                    2 articles : -5% sur le panier
                  </span>
                </li>
                <li className="flex items-center">
                  <span className={calculateTotalItems() >= 3 ? "text-green-600 font-medium" : ""}>
                    3 articles : -10% sur le panier
                  </span>
                </li>
                <li className="flex items-center">
                  <span className={calculateTotalItems() >= 4 ? "text-green-600 font-medium" : ""}>
                    4 articles : -15% sur le panier
                  </span>
                </li>
              </ul>
            </div>

            {/* Résumé des prix */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sous-total :</span>
                <span>{calculateSubtotal().toFixed(2)} €</span>
              </div>
              {calculateDiscount() > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Remise ({getDiscountPercentage(calculateTotalItems())}%) :</span>
                  <span>-{calculateDiscount().toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total :</span>
                <span>{calculateTotal().toFixed(2)} €</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Poids total :</span>
              <span>{formatWeight(calculateTotalWeight())} kg</span>
            </div>
            
            <button
              onClick={() => setShowSummary(true)}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
            >
              Commander
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modal de résumé de commande */}
      <CartSummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        state={state}
        onCreateDraftOrder={handleCreateDraftOrder}
      />

      {/* Modal des frais de livraison */}
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
