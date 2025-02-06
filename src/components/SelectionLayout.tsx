'use client';

import { useCartUI } from '@/context/CartUIContext';
import Cart from './Cart';

interface SelectionLayoutProps {
  children: React.ReactNode;
}

export default function SelectionLayout({ children }: SelectionLayoutProps) {
  const { isCartOpen } = useCartUI();

  return (
    <main 
      className="min-h-screen relative transition-all duration-300" 
      style={{ 
        backgroundColor: '#1a1a1a',
        paddingRight: isCartOpen ? '400px' : '0'
      }}
    >
      <Cart />
      <div className="py-8">
        <div className="max-w-[1920px] mx-auto px-4">
          {children}
        </div>
      </div>
    </main>
  );
}
