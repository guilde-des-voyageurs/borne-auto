'use client';

export function useNotificationSound() {
  const playNotificationSound = async () => {
    try {
      const audio = new Audio('/notification.mp3');
      
      // Premier son
      await audio.play();
      
      // Attendre 500ms puis jouer le deuxième son
      await new Promise(resolve => setTimeout(resolve, 500));
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.error('Erreur de lecture du son:', error);
    }
  };

  return playNotificationSound;
}
