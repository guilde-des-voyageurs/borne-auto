'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerInfoSlide from './CustomerInfoSlide';
import AddressSlide from './AddressSlide';
import ShippingMethodSlide from './ShippingMethodSlide';
import FinalSlide from './FinalSlide';
import { useCart } from '../../context/CartContext';

type CheckoutSlide = 'customer-info' | 'address' | 'shipping' | 'final';

interface CheckoutData {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  postalCode?: string;
  shippingMethodId?: string;
}

interface CheckoutTunnelProps {
  onClose: () => void;
}

export default function CheckoutTunnel({ onClose }: CheckoutTunnelProps) {
  const [currentSlide, setCurrentSlide] = useState<CheckoutSlide>('customer-info');
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({});
  const { state } = useCart();

  // Simuler les méthodes d'expédition (à remplacer par l'appel à l'API Shopify)
  const shippingMethods = [
    {
      id: 'standard',
      title: 'Livraison standard',
      price: '4.99',
      estimated_days: '3-5 jours ouvrés'
    },
    {
      id: 'express',
      title: 'Livraison express',
      price: '9.99',
      estimated_days: '1-2 jours ouvrés'
    }
  ];

  const handleCustomerInfo = (data: { firstName: string; lastName: string }) => {
    setCheckoutData({ ...checkoutData, ...data });
    setCurrentSlide('address');
  };

  const handleAddress = (data: {
    address1: string;
    address2?: string;
    city: string;
    postalCode: string;
  }) => {
    setCheckoutData({ ...checkoutData, ...data });
    setCurrentSlide('shipping');
  };

  const handleShippingMethod = (methodId: string) => {
    setCheckoutData({ ...checkoutData, shippingMethodId: methodId });
    setCurrentSlide('final');
  };

  const handleBack = () => {
    switch (currentSlide) {
      case 'address':
        setCurrentSlide('customer-info');
        break;
      case 'shipping':
        setCurrentSlide('address');
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
      <div className="min-h-screen py-8">
        {/* En-tête avec le total */}
        <div className="max-w-2xl mx-auto px-8 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Validation de la commande</h1>
            <div className="text-xl text-white">
              Total : {state.total.toFixed(2)} €
            </div>
          </div>
        </div>

        {/* Indicateur de progression */}
        <div className="max-w-2xl mx-auto px-8 mb-8">
          <div className="flex justify-between">
            {['Informations', 'Adresse', 'Livraison', 'Finalisation'].map((step, index) => (
              <div
                key={step}
                className="flex items-center"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= ['customer-info', 'address', 'shipping', 'final'].indexOf(currentSlide)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-600 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 3 && (
                  <div
                    className={`w-full h-1 mx-2 ${
                      index < ['customer-info', 'address', 'shipping', 'final'].indexOf(currentSlide)
                        ? 'bg-blue-500'
                        : 'bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Slides */}
        <AnimatePresence mode="wait">
          {currentSlide === 'customer-info' && (
            <CustomerInfoSlide onNext={handleCustomerInfo} />
          )}
          {currentSlide === 'address' && (
            <AddressSlide onNext={handleAddress} onBack={handleBack} />
          )}
          {currentSlide === 'shipping' && (
            <ShippingMethodSlide
              shippingMethods={shippingMethods}
              onNext={handleShippingMethod}
              onBack={handleBack}
            />
          )}
          {currentSlide === 'final' && <FinalSlide />}
        </AnimatePresence>
      </div>
    </div>
  );
}
