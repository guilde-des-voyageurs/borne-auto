'use client';

import { useRouter } from 'next/navigation';
import SoundButton from '@/components/SoundButton';

export default function DraftOrderCreatedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <SoundButton />
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Commande en cours de création
        </h1>
        <p className="text-gray-600 mb-8">
          Votre commande est en cours de préparation. Veuillez patienter...
        </p>
        <div className="space-y-4">
          <button
            onClick={() => router.push('/')}
            className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors w-full"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    </div>
  );
}
