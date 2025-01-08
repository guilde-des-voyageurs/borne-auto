'use client';

import { motion } from 'framer-motion';

interface AddressSlideProps {
  onNext: (data: {
    address1: string;
    address2?: string;
    city: string;
    postalCode: string;
  }) => void;
  onBack: () => void;
}

export default function AddressSlide({ onNext, onBack }: AddressSlideProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const address1 = (form.elements.namedItem('address1') as HTMLInputElement).value;
    const address2 = (form.elements.namedItem('address2') as HTMLInputElement).value;
    const city = (form.elements.namedItem('city') as HTMLInputElement).value;
    const postalCode = (form.elements.namedItem('postalCode') as HTMLInputElement).value;
    
    onNext({ address1, address2, city, postalCode });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto p-8"
    >
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Adresse de livraison</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="address1" className="block text-white mb-2">Adresse</label>
          <input
            type="text"
            id="address1"
            name="address1"
            required
            className="w-full p-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="Numéro et nom de rue"
          />
        </div>

        <div>
          <label htmlFor="address2" className="block text-white mb-2">Complément d'adresse (optionnel)</label>
          <input
            type="text"
            id="address2"
            name="address2"
            className="w-full p-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="Appartement, bâtiment, etc."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-white mb-2">Ville</label>
            <input
              type="text"
              id="city"
              name="city"
              required
              className="w-full p-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="Ville"
            />
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-white mb-2">Code postal</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              required
              pattern="[0-9]{5}"
              className="w-full p-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="Code postal"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="w-1/2 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold text-lg"
          >
            Retour
          </button>
          <button
            type="submit"
            className="w-1/2 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            Continuer
          </button>
        </div>
      </form>
    </motion.div>
  );
}
