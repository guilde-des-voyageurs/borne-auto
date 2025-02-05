'use client';

import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface ShippingRate {
  id: string;
  name: string;
  price: string;
  delivery_time: string;
  carrier_identifier: string;
}

interface ShippingRatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftOrderId: string;
}

export default function ShippingRatesModal({ isOpen, onClose, draftOrderId }: ShippingRatesModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);

  useEffect(() => {
    if (isOpen && draftOrderId) {
      fetchShippingRates();
    }
  }, [isOpen, draftOrderId]);

  const fetchShippingRates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/draft-orders/${draftOrderId}/shipping-rates`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch shipping rates');
      }

      const data = await response.json();
      setShippingRates(data.shipping_rates || []);
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch shipping rates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRate = async (rate: ShippingRate) => {
    try {
      setSelectedRate(rate);
      // TODO: Implémenter la mise à jour de la commande provisoire avec la méthode d'expédition sélectionnée
      onClose();
    } catch (error) {
      console.error('Error updating shipping rate:', error);
      setError(error instanceof Error ? error.message : 'Failed to update shipping rate');
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                    Méthodes d'expédition disponibles
                  </Dialog.Title>

                  <div className="mt-4">
                    {isLoading ? (
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Chargement des méthodes d'expédition...</p>
                      </div>
                    ) : error ? (
                      <div className="text-center text-red-600">
                        <p className="text-sm">{error}</p>
                      </div>
                    ) : shippingRates.length === 0 ? (
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Aucune méthode d'expédition disponible</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {shippingRates.map((rate) => (
                          <div
                            key={rate.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleSelectRate(rate)}
                          >
                            <div>
                              <h4 className="font-medium">{rate.name}</h4>
                              {rate.delivery_time && (
                                <p className="text-sm text-gray-500">{rate.delivery_time}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{parseFloat(rate.price).toFixed(2)} €</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={onClose}
                  >
                    Fermer
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
