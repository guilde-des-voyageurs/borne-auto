'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getShippingProfiles } from '../utils/shippingProfiles';

interface CartSummaryModalProps {
  onClose: () => void;
  state: {
    items: {
      [variantId: string]: {
        productId: string;
        title: string;
        variantTitle: string;
        price: string;
        quantity: number;
        image?: string;
        weight: number;
        weight_unit: string;
      };
    };
    total: number;
  };
  onCreateDraftOrder: () => Promise<void>;
}

export default function CartSummaryModal({ onClose, state, onCreateDraftOrder }: CartSummaryModalProps) {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingProfiles, setShippingProfiles] = useState<any[]>([]);
  const [selectedShippingProfile, setSelectedShippingProfile] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShippingProfiles = async () => {
      const profiles = await getShippingProfiles();
      setShippingProfiles(profiles);
      setIsLoading(false);
    };
    fetchShippingProfiles();
  }, []);

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

  const handleCreateDraftOrder = async () => {
    if (!selectedShippingProfile) {
      alert('Veuillez sélectionner un profil d\'expédition');
      return;
    }
    setIsCreatingOrder(true);
    setError(null);

    try {
      await onCreateDraftOrder();
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
            <h3 className="text-lg font-semibold mb-2">Profils d'expédition</h3>
            {isLoading ? (
              <p>Chargement des profils d'expédition...</p>
            ) : shippingProfiles.length > 0 ? (
              <div className="space-y-2">
                {shippingProfiles.map((profile) => (
                  <div key={profile.id} className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50">
                    <input
                      type="radio"
                      id={`shipping-${profile.id}`}
                      name="shipping-profile"
                      value={profile.id}
                      checked={selectedShippingProfile === profile.id}
                      onChange={(e) => setSelectedShippingProfile(e.target.value)}
                      className="form-radio h-4 w-4 text-green-600"
                    />
                    <label htmlFor={`shipping-${profile.id}`} className="flex flex-col cursor-pointer">
                      <span className="font-medium">{profile.name}</span>
                      <div className="text-sm text-gray-600">
                        {profile.price_based_shipping_rates?.map((rate: any) => (
                          <div key={rate.id} className="mt-1">
                            {rate.name}: {rate.price > 0 ? `${parseFloat(rate.price).toFixed(2)}€` : 'Gratuit'}
                          </div>
                        ))}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p>Aucun profil d'expédition disponible</p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Poids total</span>
              <span className="font-medium text-gray-800">
                {formatWeight(calculateTotalWeight())}
              </span>
            </div>
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
