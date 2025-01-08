'use client';

import { motion } from 'framer-motion';

interface CustomerInfoSlideProps {
  onNext: (data: { firstName: string; lastName: string }) => void;
}

export default function CustomerInfoSlide({ onNext }: CustomerInfoSlideProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value;
    const lastName = (form.elements.namedItem('lastName') as HTMLInputElement).value;
    
    if (firstName && lastName) {
      onNext({ firstName, lastName });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto p-8"
    >
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Vos informations</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="firstName" className="block text-white mb-2">Prénom</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            className="w-full p-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="Entrez votre prénom"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-white mb-2">Nom</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            required
            className="w-full p-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="Entrez votre nom"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
        >
          Continuer
        </button>
      </form>
    </motion.div>
  );
}
