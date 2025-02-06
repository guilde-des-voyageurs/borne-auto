'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ShippingRate {
  id: string;
  name: string;
  price: string;
  service_code: string;
  selected?: boolean;
}

interface ShippingRatesModalProps {
  onClose: () => void;
}

export default function ShippingRatesModal({ onClose }: ShippingRatesModalProps) {
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);

  const fetchShippingRates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shipping-rates');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des frais de port');
      }
      const data = await response.json();
      setShippingRates(data.shipping_rates || []);
      
      // Sélectionner automatiquement le premier tarif
      if (data.shipping_rates && data.shipping_rates.length > 0) {
        setSelectedRate(data.shipping_rates[0]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError("Impossible de récupérer les frais d'expédition");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingRates();
  }, []); // Ajouter la dépendance manquante dans useEffect

  const handleRateSelect = async (rate: ShippingRate) => {
    try {
      setSelectedRate(rate);
      
      // Mettre à jour la commande avec le tarif sélectionné
      const response = await fetch('/api/draft-orders/update-shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shipping_line: {
            title: rate.name,
            price: rate.price,
            code: rate.service_code
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour des frais d'expédition");
      }

      // Fermer la modale après la sélection
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      setError("Impossible de mettre à jour les frais d'expédition");
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des options d&apos;expédition...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <div className="text-red-600 mb-4">⚠️</div>
          <p className="text-gray-600">Impossible de récupérer les frais d&apos;expédition</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Options d&apos;expédition</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {shippingRates.map((rate) => (
              <button
                key={rate.id}
                onClick={() => handleRateSelect(rate)}
                className={`w-full p-4 rounded-lg border-2 transition-colors ${
                  selectedRate?.id === rate.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <h3 className="font-medium">{rate.name}</h3>
                  </div>
                  <div className="text-lg font-bold">
                    {parseFloat(rate.price).toFixed(2)} €
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
