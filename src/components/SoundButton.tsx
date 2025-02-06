'use client';

import { useEffect, useState } from 'react';

const playTwice = async (audio: HTMLAudioElement) => {
  try {
    // Astuce pour contourner l'autoplay
    audio.muted = true;
    await audio.play();
    audio.muted = false;
    
    // Premier son
    audio.currentTime = 0;
    await audio.play();
    
    // Attendre 500ms puis jouer le deuxième son
    await new Promise(resolve => setTimeout(resolve, 500));
    audio.currentTime = 0;
    await audio.play();
  } catch (error) {
    console.error('Erreur de lecture du son:', error);
  }
};

export default function SoundButton() {
  const [notificationSound, setNotificationSound] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Créer et précharger le son
    const audio = new Audio('/notification.mp3');
    
    // Configuration pour permettre l'autoplay
    audio.autoplay = true;
    audio.preload = 'auto';
    
    // Précharger le son
    audio.load();
    setNotificationSound(audio);

    // Jouer le son immédiatement
    playTwice(audio);

    // Cleanup function
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  const handleClick = async () => {
    if (notificationSound) {
      await playTwice(notificationSound);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full"
    >
      Tester le son de notification
    </button>
  );
}
