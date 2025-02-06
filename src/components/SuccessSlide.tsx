'use client';

import { motion } from 'framer-motion';

interface SuccessSlideProps {
  title: string;
  image: string;
  variant: string;
}

export default function SuccessSlide({ title, image, variant }: SuccessSlideProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center h-full p-8 text-white"
    >
      <div className="bg-green-500 rounded-full p-4 mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-center mb-6">Produit ajouté au panier !</h2>

      <div className="flex items-center gap-6 bg-[#666] p-6 rounded-lg mb-8">
        <img
          src={image}
          alt={title}
          className="w-32 h-32 object-contain rounded-lg bg-white"
        />
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-gray-300">{variant}</p>
        </div>
      </div>

      <p className="text-lg text-gray-300">Retour à la page d'accueil dans quelques secondes...</p>
    </motion.div>
  );
}
