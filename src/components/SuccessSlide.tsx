'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface SuccessSlideProps {
  title: string;
  image: string;
  variant: string;
}

export default function SuccessSlide({ title, image, variant }: SuccessSlideProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-xl"
    >
      <div className="w-32 h-32 mb-6 relative">
        <Image
          src={image}
          alt={title}
          width={128}
          height={128}
          className="object-cover rounded-lg"
        />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{variant}</p>
      <div className="mt-6">
        <div className="animate-bounce text-4xl">✓</div>
        <p className="text-green-600 font-medium mt-2">Produit ajouté au panier</p>
      </div>
    </motion.div>
  );
}
