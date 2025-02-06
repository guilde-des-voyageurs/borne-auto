'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main 
      className="min-h-screen bg-gray-900 flex flex-col items-center justify-center cursor-pointer"
      onClick={() => router.push('/selection')}
    >
      <h1 className="text-6xl font-bold text-white mb-6">
        Impression à la demande
      </h1>
      <p className="text-2xl text-gray-300">
        Toucher l&apos;écran pour commencer
      </p>
    </main>
  );
}