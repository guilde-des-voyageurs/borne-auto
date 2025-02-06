'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DraftOrderCreatedPage() {
  const router = useRouter();
  const [notificationSound, setNotificationSound] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Créer et précharger le son
    const audio = new Audio('/notification.mp3');
    audio.load();
    setNotificationSound(audio);

    // Jouer le son automatiquement quand la page est chargée
    audio.play().catch(error => console.error('Erreur de lecture du son:', error));
  }, []);

  const playSound = () => {
    if (notificationSound) {
      notificationSound.currentTime = 0; // Remettre le son au début
      notificationSound.play().catch(error => console.error('Erreur de lecture du son:', error));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
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
          <button
            onClick={playSound}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full"
          >
            Tester le son de notification
          </button>
        </div>
      </div>
    </div>
  );
}
