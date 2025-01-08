'use client';

import { motion } from 'framer-motion';

export default function FinalSlide() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto p-8 text-center"
    >
      <div className="bg-blue-500 w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-white mb-6">
        Merci pour votre commande !
      </h2>

      <p className="text-xl text-gray-300 mb-8">
        Un vendeur va venir vous voir dans quelques instants pour confirmer votre panier et procéder au paiement.
      </p>

      <div className="animate-pulse text-gray-400">
        En attente d'un vendeur...
      </div>
    </motion.div>
  );
}
