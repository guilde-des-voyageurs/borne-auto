'use client';

import { useEffect, useState } from 'react';

interface Order {
  id: string;
  name: string;
}

export default function SignalDisplay() {
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connexion en cours...');

  useEffect(() => {
    const eventSource = new EventSource('/api/notifications');

    eventSource.onopen = () => {
      setConnectionStatus('Connecté et en attente de nouvelles commandes...');
    };

    eventSource.onerror = () => {
      setConnectionStatus('Erreur de connexion. Tentative de reconnexion...');
    };

    eventSource.onmessage = (event) => {
      console.log('Received message:', event.data);
      const data = JSON.parse(event.data);
      
      if (data.type === 'new_order') {
        console.log('New order received:', data.order);
        setLatestOrder(data.order);
        setShowNotification(true);
        
        // Faire clignoter la notification
        const interval = setInterval(() => {
          setShowNotification(prev => !prev);
        }, 500);

        // Arrêter le clignotement après 5 secondes
        setTimeout(() => {
          clearInterval(interval);
          setShowNotification(true);
        }, 5000);
      }
    };

    return () => {
      console.log('Closing EventSource connection');
      eventSource.close();
    };
  }, []);

  if (!latestOrder) {
    return (
      <div className="text-white text-2xl">
        {connectionStatus}
      </div>
    );
  }

  return (
    <div className={`text-center transition-opacity duration-300 ${showNotification ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-white rounded-lg p-8 shadow-2xl max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          Nouvelle commande !
        </h1>
        <p className="text-2xl text-gray-800">
          La commande provisoire {latestOrder.name} vient d&apos;être créée
        </p>
        <p className="text-xl text-gray-600 mt-4">
          Veuillez vous rendre à la borne pour finaliser la commande
        </p>
      </div>
    </div>
  );
}
