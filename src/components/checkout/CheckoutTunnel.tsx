'use client';

import { shippingMethods } from '../../utils/shipping';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerInfoSlide from './CustomerInfoSlide';
import AddressSlide from './AddressSlide';
import ShippingMethodSlide from './ShippingMethodSlide';
import FinalSlide from './FinalSlide';
import { useCart } from '../../context/CartContext';
import ContactInfoSlide from './ContactInfoSlide';

type CheckoutSlide = 'customer-info' | 'address' | 'contact' | 'shipping' | 'final';

interface CheckoutData {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  postalCode?: string;
  email?: string;
  phone?: string;
  shippingMethodId?: string;
}

interface CheckoutTunnelProps {
  onClose: () => void;
}

export default function CheckoutTunnel({ onClose }: CheckoutTunnelProps) {
  const [currentSlide, setCurrentSlide] = useState<CheckoutSlide>('customer-info');
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({});
  const { state } = useCart();

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
    setCurrentSlide('contact');
  };

  const handleContact = (data: { email?: string; phone?: string }) => {
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
      case 'contact':
        setCurrentSlide('address');
        break;
      case 'shipping':
        setCurrentSlide('contact');
        break;
      case 'final':
        setCurrentSlide('shipping');
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
      <div className="min-h-screen py-8">
        {/* En-tête avec le total et bouton de fermeture */}
        <div className="max-w-2xl mx-auto px-8 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Validation de la commande</h1>
            <div className="flex items-center gap-4">
              <div className="text-xl text-white">
                Total : {state.total.toFixed(2)} €
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Indicateur de progression */}
        <div className="max-w-2xl mx-auto px-8 mb-8">
          <div className="flex justify-between">
            {['Informations', 'Adresse', 'Contact', 'Livraison', 'Finalisation'].map((step, index) => (
              <div
                key={step}
                className="flex items-center"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= ['customer-info', 'address', 'contact', 'shipping', 'final'].indexOf(currentSlide)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-600 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 4 && (
                  <div
                    className={`w-full h-1 mx-2 ${
                      index < ['customer-info', 'address', 'contact', 'shipping', 'final'].indexOf(currentSlide)
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
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {currentSlide === 'customer-info' && (
              <CustomerInfoSlide onNext={handleCustomerInfo} />
            )}
            {currentSlide === 'address' && (
              <AddressSlide onNext={handleAddress} onBack={handleBack} />
            )}
            {currentSlide === 'contact' && (
              <ContactInfoSlide 
              key="contact" 
              onNext={handleContact} 
              onBack={() => setCurrentSlide('address')} 
              />
            )}
            {currentSlide === 'shipping' && (
              <ShippingMethodSlide
                shippingMethods={shippingMethods}
                onNext={handleShippingMethod}
                onBack={handleBack}
              />
            )}
            {currentSlide === 'final' && <FinalSlide onBack={() => setCurrentSlide('shipping')} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
