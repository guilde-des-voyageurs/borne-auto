'use client';

import { useCart, CartItem } from '../context/CartContext';
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

  const calculateTotalWeight = () => {
    return Object.entries(state.items).reduce((total, [, item]) => {
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
          quantity: item.quantity,
          weight: item.weight
        };
      });

      const totalItems = calculateTotalItems();
      const discountPercentage = getDiscountPercentage(totalItems);
      
      let applied_discount;
      if (discountPercentage > 0) {
        applied_discount = {
          description: `${discountPercentage}% de réduction`,
          value: discountPercentage,
          value_type: 'percentage',
          amount: calculateDiscount().toFixed(2),
          title: `Réduction ${discountPercentage}%`
        };
      }

      const response = await fetch('/api/draft-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          line_items,
          customer: options.customer,
          applied_discount
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create draft order');
      }

      const data = await response.json();
      console.log('Draft order created:', data);

      // Fermer la modale du résumé et ouvrir celle des frais de port
      setShowSummary(false);
      setShowShippingRates(true);

      // Vider le panier une fois la commande créée
      clearCart();
    } catch (error) {
      console.error('Error creating draft order:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="bg-black text-white p-4 rounded-lg shadow-lg"
      >
        <button
          onClick={() => setShowSummary(true)}
          className="flex items-center space-x-2 mb-2"
        >
          <span className="text-lg">🛒</span>
          <span className="font-bold">{calculateTotalItems()} article{calculateTotalItems() > 1 ? 's' : ''}</span>
        </button>

        <AnimatePresence>
          {showSummary && (
            <CartSummaryModal
              items={state.items}
              onClose={() => setShowSummary(false)}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onCreateDraftOrder={handleCreateDraftOrder}
              totalWeight={calculateTotalWeight()}
              subtotal={calculateSubtotal()}
              discount={calculateDiscount()}
              total={calculateTotal()}
              discountPercentage={getDiscountPercentage(calculateTotalItems())}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showShippingRates && (
            <ShippingRatesModal
              onClose={() => setShowShippingRates(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
