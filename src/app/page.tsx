'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <main
      onClick={() => router.push('/selection')}
      className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white cursor-pointer transition-colors hover:bg-gray-800"
    >
      <h1 className="text-4xl font-bold mb-4">Impression à la demande</h1>
      <p className="text-xl text-gray-300">Toucher l'écran pour commencer</p>
    </main>
  );
}