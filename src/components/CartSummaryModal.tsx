'use client';

import React, { Fragment } from 'react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from './icons';

interface CartItem {
  productId: string;
  title: string;
  variantTitle: string;
  price: string;
  quantity: number;
  image?: string;
  weight: number;
  weight_unit: string;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  postalCode: string;
  acceptsMarketing: boolean;
  country: string;
}

interface CartItems {
  [variantId: string]: CartItem;
}

interface CartSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: {
    items: CartItems;
  };
  onCreateDraftOrder: (options: { 
    customer: CustomerInfo
  }) => Promise<void>;
}

const playNotificationSound = async () => {
  try {
    const audio = new Audio('/notification.mp3');
    
    // Premier son
    await audio.play();
    
    // Attendre 500ms puis jouer le deuxième son
    await new Promise(resolve => setTimeout(resolve, 500));
    audio.currentTime = 0;
    await audio.play();
  } catch (error) {
    console.error('Erreur de lecture du son:', error);
  }
};

const calculateTotalItems = (state: CartSummaryModalProps['state']) => {
  return Object.values(state.items).reduce((total, item) => total + item.quantity, 0);
};

const getDiscountPercentage = (totalItems: number) => {
  if (totalItems >= 4) return 15;
  if (totalItems >= 3) return 10;
  if (totalItems >= 2) return 5;
  return 0;
};

const calculateSubtotal = (state: CartSummaryModalProps['state']) => {
  return Object.values(state.items).reduce((total, item) => {
    return total + (parseFloat(item.price) * item.quantity);
  }, 0);
};

const calculateDiscount = (state: CartSummaryModalProps['state']) => {
  const subtotal = calculateSubtotal(state);
  const discountPercentage = getDiscountPercentage(calculateTotalItems(state));
  return (subtotal * discountPercentage) / 100;
};

const calculateTotal = (state: CartSummaryModalProps['state']) => {
  const subtotal = calculateSubtotal(state);
  const discount = calculateDiscount(state);
  return subtotal - discount;
};

export default function CartSummaryModal({ isOpen, onClose, state, onCreateDraftOrder }: CartSummaryModalProps) {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    city: '',
    postalCode: '',
    acceptsMarketing: false,
    country: 'FR'
  });

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const isCustomerInfoValid = () => {
    return (
      customerInfo.firstName.trim() !== '' &&
      customerInfo.lastName.trim() !== '' &&
      customerInfo.email.trim() !== '' &&
      customerInfo.phone.trim() !== '' &&
      customerInfo.address1.trim() !== '' &&
      customerInfo.city.trim() !== '' &&
      customerInfo.postalCode.trim() !== '' &&
      customerInfo.country.trim() !== ''
    );
  };

  const handleCreateOrder = async () => {
    try {
      setIsCreatingOrder(true);
      setError(null);

      if (!isCustomerInfoValid()) {
        setError("Veuillez remplir tous les champs obligatoires");
        setIsCreatingOrder(false);
        return;
      }

      await onCreateDraftOrder({
        customer: customerInfo
      });

      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-white">
                    Résumé de la commande
                  </Dialog.Title>
                  <button
                    onClick={() => {
                      setCustomerInfo({
                        firstName: "Uriel",
                        lastName: "Lahoussaye",
                        email: "uriel@lahoussaye.fr",
                        phone: "06 19 93 43 28",
                        address1: "421 Chemin du Baudaric",
                        city: "Contes",
                        postalCode: "06390",
                        country: "FR",
                        acceptsMarketing: false
                      });
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Remplir mes infos
                  </button>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <div className="mt-2">
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-white">Articles</h4>
                      <ul className="mt-2 divide-y divide-gray-700">
                        {Object.entries(state.items).map(([variantId, item]) => (
                          <li key={variantId} className="flex items-center justify-between py-2">
                            <div className="flex items-center">
                              <span className="ml-2 text-sm text-gray-300">{item.title}</span>
                              <span className="ml-1 text-sm text-gray-300">({item.quantity}x)</span>
                            </div>
                            <span className="text-sm font-medium text-white">
                              {(parseFloat(item.price) * item.quantity).toFixed(2)} €
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-white">Informations client</h4>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">
                            Prénom
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            value={customerInfo.firstName}
                            onChange={handleCustomerInfoChange}
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
                            Nom
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            value={customerInfo.lastName}
                            onChange={handleCustomerInfoChange}
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={customerInfo.email}
                            onChange={handleCustomerInfoChange}
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={customerInfo.phone}
                            onChange={handleCustomerInfoChange}
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="address1" className="block text-sm font-medium text-gray-300">
                            Adresse
                          </label>
                          <input
                            type="text"
                            name="address1"
                            id="address1"
                            value={customerInfo.address1}
                            onChange={handleCustomerInfoChange}
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-300">
                            Ville
                          </label>
                          <input
                            type="text"
                            name="city"
                            id="city"
                            value={customerInfo.city}
                            onChange={handleCustomerInfoChange}
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-300">
                            Code postal
                          </label>
                          <input
                            type="text"
                            name="postalCode"
                            id="postalCode"
                            value={customerInfo.postalCode}
                            onChange={handleCustomerInfoChange}
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-gray-300">
                            Pays
                          </label>
                          <select
                            id="country"
                            name="country"
                            value={customerInfo.country}
                            onChange={handleCustomerInfoChange}
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value="">Sélectionnez un pays</option>
                            <option value="FR">France</option>
                            <option value="BE">Belgique</option>
                            <option value="LU">Luxembourg</option>
                            <option value="DE">Allemagne</option>
                            <option value="IT">Italie</option>
                            <option value="ES">Espagne</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-start">
                            <div className="flex h-5 items-center">
                              <input
                                id="acceptsMarketing"
                                name="acceptsMarketing"
                                type="checkbox"
                                checked={customerInfo.acceptsMarketing}
                                onChange={handleCustomerInfoChange}
                                className="h-4 w-4 rounded border-gray-700 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="acceptsMarketing" className="font-medium text-gray-300">
                                Accepter de recevoir des communications marketing
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-white">Résumé</h4>
                      <div className="mt-2 space-y-4">
                        {/* Promotions */}
                        <div className="bg-gray-700 p-3 rounded-lg">
                          <h4 className="font-medium text-white mb-2">Promotions disponibles</h4>
                          <ul className="text-sm space-y-1 text-gray-300">
                            {[
                              { id: "promo-2", threshold: 2, discount: 5 },
                              { id: "promo-3", threshold: 3, discount: 10 },
                              { id: "promo-4", threshold: 4, discount: 15 }
                            ].map((promo) => (
                              <li key={promo.id} className="flex items-center">
                                <span className={calculateTotalItems(state) >= promo.threshold ? "text-indigo-400 font-medium" : ""}>
                                  {promo.threshold} articles : -{promo.discount}% sur le panier
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Totaux */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-300">
                            <span>Sous-total</span>
                            <span>{calculateSubtotal(state).toFixed(2)} €</span>
                          </div>
                          {calculateDiscount(state) > 0 && (
                            <div className="flex justify-between text-sm text-indigo-400">
                              <span>Remise ({getDiscountPercentage(calculateTotalItems(state))}%)</span>
                              <span>-{calculateDiscount(state).toFixed(2)} €</span>
                            </div>
                          )}
                          <div className="flex justify-between text-base font-medium text-white">
                            <span>Total</span>
                            <span>{calculateTotal(state).toFixed(2)} €</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 text-center text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                    onClick={handleCreateOrder}
                    disabled={isCreatingOrder}
                  >
                    {isCreatingOrder ? 'Création...' : 'Créer la commande'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-600 hover:bg-gray-600 sm:col-start-1 sm:mt-0"
                    onClick={onClose}
                  >
                    Annuler
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
