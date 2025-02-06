'use client';

import { useCart } from '../context/CartContext';
import { useCartUI } from '../context/CartUIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import CartSummaryModal from './CartSummaryModal';
import ShippingRatesModal from './ShippingRatesModal';
import { usePathname } from 'next/navigation';
import { TrashIcon, MinusIcon, PlusIcon } from './icons';

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
  const { isCartOpen, setIsCartOpen } = useCartUI();
  const [showSummary, setShowSummary] = useState(false);
  const [showShippingRates, setShowShippingRates] = useState(false);
  const [currentDraftOrderId, setCurrentDraftOrderId] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (Object.keys(state.items).length > 0) {
      setIsCartOpen(true);
    } else {
      setIsCartOpen(false);
    }
  }, [state.items, setIsCartOpen]);

  // Si le panier est vide ou si nous ne sommes pas sur la bonne page, ne rien afficher
  if ((pathname !== '/' && pathname !== '/selection') || Object.keys(state.items).length === 0) {
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
        return {
          variant_id: extractedVariantId,
          quantity: item.quantity
        };
      });

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
          className="fixed inset-y-0 right-0 w-[400px] bg-gray-800 border-l border-gray-700 shadow-xl overflow-hidden"
        >
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-white">Panier</h2>
                <div className="ml-3 flex h-7 items-center">
                  <button
                    type="button"
                    className="relative -m-2 p-2 text-gray-400 hover:text-gray-300"
                    onClick={clearCart}
                  >
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Vider le panier</span>
                    <TrashIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <div className="flow-root">
                  <ul role="list" className="-my-6 divide-y divide-gray-700">
                    {Object.entries(state.items).map(([variantId, item]) => (
                      <li key={variantId} className="flex py-6">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-700 bg-gray-900">
                          <img
                            src={item.image || '/placeholder.png'}
                            alt={item.title}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>

                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-white">
                              <h3>{item.title}</h3>
                              <p className="ml-4">{(parseFloat(item.price) * item.quantity).toFixed(2)} €</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-400">{item.variantTitle}</p>
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(variantId, item.quantity - 1)}
                                className="text-gray-400 hover:text-gray-300"
                              >
                                <MinusIcon className="h-5 w-5" />
                              </button>
                              <p className="text-white">{item.quantity}</p>
                              <button
                                onClick={() => updateQuantity(variantId, item.quantity + 1)}
                                className="text-gray-400 hover:text-gray-300"
                              >
                                <PlusIcon className="h-5 w-5" />
                              </button>
                            </div>

                            <div className="flex">
                              <button
                                type="button"
                                onClick={() => removeItem(variantId)}
                                className="font-medium text-indigo-400 hover:text-indigo-300"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 py-6 px-4 sm:px-6">
              <div className="flex justify-between text-base font-medium text-white">
                <p>Sous-total</p>
                <p>{calculateSubtotal().toFixed(2)} €</p>
              </div>
              {calculateDiscount() > 0 && (
                <div className="flex justify-between text-sm text-indigo-400 mt-2">
                  <p>Remise ({getDiscountPercentage(calculateTotalItems())}%)</p>
                  <p>-{calculateDiscount().toFixed(2)} €</p>
                </div>
              )}
              <div className="flex justify-between text-base font-medium text-white mt-2">
                <p>Total</p>
                <p>{calculateTotal().toFixed(2)} €</p>
              </div>
              <div className="mt-4">
                <div className="rounded-md bg-gray-700 p-4">
                  <h4 className="text-sm font-medium text-white mb-2">Promotions disponibles</h4>
                  <ul className="text-sm space-y-1 text-gray-300">
                    {[
                      { id: "promo-2", threshold: 2, discount: 5 },
                      { id: "promo-3", threshold: 3, discount: 10 },
                      { id: "promo-4", threshold: 4, discount: 15 }
                    ].map((promo) => (
                      <li key={promo.id} className="flex items-center">
                        <span className={calculateTotalItems() >= promo.threshold ? "text-indigo-400 font-medium" : ""}>
                          {promo.threshold} articles : -{promo.discount}% sur le panier
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-400">Frais de livraison calculés à la commande.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowSummary(true)}
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  Commander
                </button>
              </div>
            </div>
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
