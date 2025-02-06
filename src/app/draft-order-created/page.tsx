'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SoundButton from '@/components/SoundButton';

export default function DraftOrderCreatedPage() {
  const router = useRouter();

  useEffect(() => {
    const audio = new Audio('/success.mp3');
    audio.play();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">🎉 Commande créée avec succès !</h1>
        <p className="text-xl text-gray-300 mb-8">
          Votre commande a été enregistrée. Nous allons la traiter dans les plus brefs délais.
        </p>
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    </main>
  );
}
