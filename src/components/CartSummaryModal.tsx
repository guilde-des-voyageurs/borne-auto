'use client';

import React, { Fragment, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { getShippingRates, type ShippingRate } from '../utils/shippingRates';

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

interface CartSummaryModalProps {
  onClose: () => void;
  state: {
    items: {
      [variantId: string]: CartItem;
    };
    total: number;
  };
  onCreateDraftOrder: (options: { 
    customer: CustomerInfo,
    shippingLine: { 
      title: string;
      price: string;
    }
  }) => Promise<void>;
}

export default function CartSummaryModal({ onClose, state, onCreateDraftOrder }: CartSummaryModalProps) {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedShippingRate, setSelectedShippingRate] = useState<ShippingRate | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    city: '',
    postalCode: '',
    acceptsMarketing: false,
    country: ''
  });

  // Récupérer les frais d'expédition lorsque le pays change
  useEffect(() => {
    if (customerInfo.country) {
      const rates = getShippingRates(customerInfo.country);
      setShippingRates(rates);
      setSelectedShippingRate(null);
    }
  }, [customerInfo.country]);

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

  const handleCreateDraftOrder = async () => {
    if (!isCustomerInfoValid()) {
      alert('Veuillez remplir tous les champs du formulaire client');
      return;
    }

    if (!selectedShippingRate) {
      alert('Veuillez sélectionner une méthode d\'expédition');
      return;
    }

    setIsCreatingOrder(true);
    setError(null);

    try {
      await onCreateDraftOrder({
        customer: customerInfo,
        shippingLine: {
          title: selectedShippingRate.name,
          price: selectedShippingRate.price
        }
      });
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = state.total;
    const shippingCost = selectedShippingRate ? parseFloat(selectedShippingRate.price) : 0;
    return subtotal + shippingCost;
  };

  return (
    <Transition.Root show={true} as={Fragment}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Résumé de la commande
                    </Dialog.Title>
                    <div className="mt-2">
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900">Articles</h4>
                        <ul className="mt-2 divide-y divide-gray-200">
                          {Object.values(state.items).map((item) => (
                            <li key={item.productId} className="flex items-center justify-between py-2">
                              <div className="flex items-center">
                                <span className="ml-2 text-sm text-gray-500">{item.title}</span>
                                <span className="ml-1 text-sm text-gray-500">({item.quantity}x)</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {(parseFloat(item.price) * item.quantity).toFixed(2)} €
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900">Informations client</h4>
                        <div className="mt-2 grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                              Prénom
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              id="firstName"
                              value={customerInfo.firstName}
                              onChange={handleCustomerInfoChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                              Nom
                            </label>
                            <input
                              type="text"
                              name="lastName"
                              id="lastName"
                              value={customerInfo.lastName}
                              onChange={handleCustomerInfoChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={customerInfo.email}
                              onChange={handleCustomerInfoChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                              Téléphone
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              id="phone"
                              value={customerInfo.phone}
                              onChange={handleCustomerInfoChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <label htmlFor="address1" className="block text-sm font-medium text-gray-700">
                              Adresse
                            </label>
                            <input
                              type="text"
                              name="address1"
                              id="address1"
                              value={customerInfo.address1}
                              onChange={handleCustomerInfoChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                              Ville
                            </label>
                            <input
                              type="text"
                              name="city"
                              id="city"
                              value={customerInfo.city}
                              onChange={handleCustomerInfoChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                              Code postal
                            </label>
                            <input
                              type="text"
                              name="postalCode"
                              id="postalCode"
                              value={customerInfo.postalCode}
                              onChange={handleCustomerInfoChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                              Pays
                            </label>
                            <select
                              id="country"
                              name="country"
                              value={customerInfo.country}
                              onChange={handleCustomerInfoChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="acceptsMarketing" className="font-medium text-gray-700">
                                  Accepter de recevoir des communications marketing
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {customerInfo.country && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900">Méthode d'expédition</h4>
                          <div className="mt-2 space-y-2">
                            {shippingRates.length > 0 ? (
                              shippingRates.map((rate) => (
                                <div key={rate.id} className="flex items-center">
                                  <input
                                    type="radio"
                                    id={rate.id}
                                    name="shippingRate"
                                    value={rate.id}
                                    checked={selectedShippingRate?.id === rate.id}
                                    onChange={() => setSelectedShippingRate(rate)}
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <label htmlFor={rate.id} className="ml-3 flex justify-between w-full">
                                    <span className="text-sm text-gray-900">{rate.name}</span>
                                    <span className="text-sm font-medium text-gray-900">
                                      {parseFloat(rate.price).toFixed(2)} €
                                    </span>
                                  </label>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500">
                                Aucune méthode d'expédition disponible pour cette destination
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 border-t pt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Sous-total</span>
                          <span className="font-medium text-gray-900">{state.total.toFixed(2)} €</span>
                        </div>
                        {selectedShippingRate && (
                          <div className="flex justify-between text-sm mt-2">
                            <span className="text-gray-500">Frais d'expédition</span>
                            <span className="font-medium text-gray-900">
                              {parseFloat(selectedShippingRate.price).toFixed(2)} €
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-base font-medium text-gray-900 mt-4">
                          <span>Total</span>
                          <span>{calculateTotal().toFixed(2)} €</span>
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
                    onClick={handleCreateDraftOrder}
                    disabled={isCreatingOrder}
                  >
                    {isCreatingOrder ? 'Création...' : 'Créer la commande'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
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
