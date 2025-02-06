'use client';

import SoundButton from './SoundButton';
import { useRouter } from 'next/navigation';

interface Props {
  name?: string;
  draftOrderId: string;
  orderNumber: string;
}

export default function DraftOrderDisplay({ name, draftOrderId, orderNumber }: Props) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 relative">
      <div className="hidden">
        <SoundButton />
      </div>
      
      <div className="mb-8 text-center">
        <h1 className="text-6xl font-bold text-green-600 mb-2">
          {name ? `Merci ${name} !` : 'Merci !'}
        </h1>
      </div>

      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center space-y-8">
        <h2 className="text-4xl font-bold text-green-600">
          Commande {orderNumber} en cours de création
        </h2>
        <p className="text-xl text-gray-600">
          Un vendeur va venir finaliser ta commande. Merci de patienter, ou de nous faire signe 🥳
        </p>
      </div>

      <button
        onClick={() => router.push('/')}
        className="fixed bottom-0 right-0 w-32 h-32 opacity-0"
        aria-label="Retour à l'accueil"
      />
    </div>
  );
}
