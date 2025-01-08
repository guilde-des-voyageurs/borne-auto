'use client';

import { motion } from 'framer-motion';

interface ContactInfoSlideProps {
  onNext: (data: { email?: string; phone?: string }) => void;
  onBack: () => void;
}

export default function ContactInfoSlide({ onNext, onBack }: ContactInfoSlideProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;

    if (!email && !phone) {
      alert('Veuillez fournir au moins un moyen de contact (email ou téléphone)');
      return;
    }

    onNext({ email, phone });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto p-8"
    >
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Coordonnées de contact</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-white mb-2">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full p-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="exemple@email.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-white mb-2">Téléphone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="w-full p-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="06 12 34 56 78"
          />
        </div>

        <p className="text-gray-400 text-sm">Veuillez fournir au moins un moyen de contact (email ou téléphone)</p>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-4 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition-colors"
          >
            Retour
          </button>
          <button
            type="submit"
            className="px-8 py-4 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            Continuer
          </button>
        </div>
      </form>
    </motion.div>
  );
}
