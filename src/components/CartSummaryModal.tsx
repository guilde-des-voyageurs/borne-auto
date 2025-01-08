'use client';

import React, { Fragment } from 'react';
import { useCart } from '../context/CartContext';
import { useState, useEffect, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { getShippingProfiles } from '../utils/shippingProfiles';

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

interface ShippingRate {
  id: string;
  name: string;
  weight_low: number;
  weight_high: number;
  price: number;
}

interface Country {
  id: string;
  name: string;
  code: string;
}

interface ShippingZone {
  id: string;
  name: string;
  countries: Country[];
  weight_based_shipping_rates?: ShippingRate[];
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
}

interface CartSummaryModalProps {
  onClose: () => void;
  state: {
    items: {
      [variantId: string]: CartItem;
    };
    total: number;
  };
  onCreateDraftOrder: (options: { shippingLine: { title: string; shippingRateId: string; price: string }, customer: CustomerInfo & { country: string } }) => Promise<void>;
}

export default function CartSummaryModal({ onClose, state, onCreateDraftOrder }: CartSummaryModalProps) {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingProfiles, setShippingProfiles] = useState<ShippingZone[]>([]);
  const [selectedShippingProfile, setSelectedShippingProfile] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    city: '',
    postalCode: '',
    acceptsMarketing: false
  });

  // Liste des pays disponibles à partir des zones d'expédition
  const availableCountries = useMemo(() => {
    const countries = shippingProfiles.flatMap(zone => zone.countries);
    // Supprimer les doublons basés sur le code pays
    return Array.from(new Map(countries.map(country => [country.code, country])).values());
  }, [shippingProfiles]);

  // Trouver la zone d'expédition pour le pays sélectionné
  const selectedZone = useMemo(() => {
    if (!selectedCountry) return null;
    return shippingProfiles.find(zone => 
      zone.countries.some(country => country.code === selectedCountry)
    );
  }, [shippingProfiles, selectedCountry]);

  useEffect(() => {
    const fetchShippingProfiles = async () => {
      const profiles = await getShippingProfiles();
      setShippingProfiles(profiles);
      setIsLoading(false);
    };
    fetchShippingProfiles();
  }, []);

  // Réinitialiser la méthode d'expédition sélectionnée quand le pays change
  useEffect(() => {
    setSelectedShippingProfile('');
  }, [selectedCountry]);

  // Log de la sélection
  useEffect(() => {
    if (selectedShippingProfile && selectedZone) {
      const selectedRate = selectedZone.weight_based_shipping_rates?.find(
        rate => rate.id.toString() === selectedShippingProfile
      );

      console.log('Sélection:', {
        country: availableCountries.find(c => c.code === selectedCountry)?.name,
        zone: selectedZone.name,
        method: selectedRate?.name
      });
    }
  }, [selectedShippingProfile, selectedZone, selectedCountry, availableCountries]);

  const calculateTotalWeight = () => {
    return Object.entries(state.items).reduce((total, [_, item]: [string, any]) => {
      return total + (item.weight * item.quantity);
    }, 0);
  };

  const formatWeight = (weight: number, unit: string = 'kg') => {
    // Convertir en kg si le poids est en grammes
    const weightInKg = unit === 'g' ? weight / 1000 : weight;
    return `${weightInKg.toFixed(2)} kg`;
  };

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      customerInfo.postalCode.trim() !== ''
    );
  };

  const handleCreateDraftOrder = async () => {
    if (!isCustomerInfoValid()) {
      alert('Veuillez remplir tous les champs du formulaire client');
      return;
    }
    if (!selectedCountry) {
      alert('Veuillez sélectionner un pays');
      return;
    }
    if (!selectedShippingProfile) {
      alert('Veuillez sélectionner une méthode d\'expédition');
      return;
    }

    setIsCreatingOrder(true);
    setError(null);

    try {
      const selectedRate = selectedZone?.weight_based_shipping_rates?.find(
        rate => rate.id.toString() === selectedShippingProfile
      );

      if (!selectedRate) {
        throw new Error('Méthode d\'expédition non trouvée');
      }

      await onCreateDraftOrder({
        shippingLine: {
          title: selectedRate.name,
          shippingRateId: selectedRate.id,
          price: selectedRate.price.toString()
        },
        customer: {
          ...customerInfo,
          country: selectedCountry
        }
      });
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const calculateTotalWithShipping = () => {
    const selectedRate = selectedZone?.weight_based_shipping_rates?.find(
      rate => rate.id.toString() === selectedShippingProfile
    );
    return state.total + (selectedRate?.price || 0);
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
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
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
                    <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-gray-900 mb-8">
                      Finaliser votre commande
                    </Dialog.Title>

                    {/* Formulaire client */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">Informations client</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                            Prénom
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={customerInfo.firstName}
                            onChange={handleCustomerInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                            Nom
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={customerInfo.lastName}
                            onChange={handleCustomerInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={customerInfo.email}
                            onChange={handleCustomerInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={customerInfo.phone}
                            onChange={handleCustomerInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-1">
                            Adresse
                          </label>
                          <input
                            type="text"
                            id="address1"
                            name="address1"
                            value={customerInfo.address1}
                            onChange={handleCustomerInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                            Ville
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={customerInfo.city}
                            onChange={handleCustomerInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                            Code postal
                          </label>
                          <input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            value={customerInfo.postalCode}
                            onChange={handleCustomerInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            required
                          />
                        </div>
                        <div className="col-span-2 mt-4">
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="acceptsMarketing"
                                name="acceptsMarketing"
                                type="checkbox"
                                checked={customerInfo.acceptsMarketing}
                                onChange={handleCustomerInfoChange}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3">
                              <label htmlFor="acceptsMarketing" className="text-sm text-gray-700">
                                Je souhaite recevoir occasionnellement des nouvelles de la marque par email
                              </label>
                              <p className="text-xs text-gray-500">
                                Vous pourrez vous désinscrire à tout moment via le lien présent dans nos emails
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sélection du pays et méthode d'expédition */}
                    <div className="mt-8">
                      <h4 className="text-lg font-semibold mb-4">Expédition</h4>
                      <div className="space-y-4">
                        {/* Sélection du pays */}
                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                            Pays
                          </label>
                          <select
                            id="country"
                            name="country"
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                            required
                          >
                            <option value="">Sélectionnez un pays</option>
                            {availableCountries.map((country) => (
                              <option key={country.code} value={country.code}>
                                {country.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Méthodes d'expédition */}
                        {selectedZone && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Méthode d'expédition
                            </label>
                            <div className="space-y-2">
                              {selectedZone?.weight_based_shipping_rates?.map((rate) => (
                                <div key={rate.id} className="flex items-center">
                                  <input
                                    type="radio"
                                    id={`shipping-${rate.id}`}
                                    name="shipping-method"
                                    value={rate.id}
                                    checked={selectedShippingProfile === rate.id.toString()}
                                    onChange={(e) => setSelectedShippingProfile(e.target.value)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                  />
                                  <label htmlFor={`shipping-${rate.id}`} className="ml-3">
                                    <div className="font-medium">{rate.name}</div>
                                    <div className="text-sm text-gray-600">
                                      {rate.price > 0 ? `${rate.price.toFixed(2)}€` : 'Gratuit'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Pour {rate.weight_low}kg - {rate.weight_high}kg
                                    </div>
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total avec frais d'expédition */}
                    <div className="mt-6 border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Sous-total :</span>
                        <span className="font-medium">{state.total.toFixed(2)}€</span>
                      </div>
                      {selectedShippingProfile && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Frais d'expédition :</span>
                          <span className="font-medium">
                            {(selectedZone?.weight_based_shipping_rates?.find(
                              rate => rate.id.toString() === selectedShippingProfile
                            )?.price || 0).toFixed(2)}€
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total :</span>
                        <span>{calculateTotalWithShipping().toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="mt-8 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:col-start-2"
                    onClick={handleCreateDraftOrder}
                  >
                    Valider la commande
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
