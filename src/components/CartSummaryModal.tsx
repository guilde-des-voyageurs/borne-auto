'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
          price: '0'
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

  return (
    <AnimatePresence>
      <>
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
          animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
          exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
          className="fixed left-1/2 top-1/2 w-full max-w-lg bg-white rounded-lg shadow-xl z-50 p-6"
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

          <div className="mt-4">
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

            {/* Sélection du pays */}
            <div className="mb-6">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Pays de livraison
              </label>
              <select
                id="country"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
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
            {selectedCountry && (
              <>
                <h3 className="text-lg font-semibold mb-2">Méthodes d'expédition</h3>
                <div className="text-sm text-gray-500 mb-4">
                  Poids total du panier : {calculateTotalWeight().toFixed(2)}kg
                </div>
                {isLoading ? (
                  <p>Chargement des méthodes d'expédition...</p>
                ) : selectedZone?.weight_based_shipping_rates?.length ? (
                  <div className="space-y-2">
                    {selectedZone.weight_based_shipping_rates
                      .filter((rate) => {
                        const totalWeight = calculateTotalWeight();
                        return totalWeight >= rate.weight_low && totalWeight <= rate.weight_high;
                      })
                      .map((rate) => (
                        <div key={rate.id} className="ml-4 mb-2">
                          <div className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50">
                            <input
                              type="radio"
                              id={`shipping-${rate.id}`}
                              name="shipping-rate"
                              value={rate.id}
                              checked={selectedShippingProfile === rate.id.toString()}
                              onChange={(e) => setSelectedShippingProfile(e.target.value)}
                              className="form-radio h-4 w-4 text-green-600"
                            />
                            <label htmlFor={`shipping-${rate.id}`} className="flex flex-col cursor-pointer">
                              <span className="font-medium">{rate.name}</span>
                              <span className="text-xs text-gray-500">
                                Pour {rate.weight_low}kg - {rate.weight_high}kg
                              </span>
                            </label>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p>Aucune méthode d'expédition disponible pour ce pays et ce poids</p>
                )}
              </>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
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

    </AnimatePresence>
  );
}
