'use client';

import { usePathname } from 'next/navigation';

export default function MainContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto py-8 px-4">
        {children}
        {pathname === '/' && <></>}
      </main>
    </div>
  );
}
