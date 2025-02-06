'use client';

import { useCart } from '../context/CartContext';
import { usePathname } from 'next/navigation';

export default function MainContainer({ children }: { children: React.ReactNode }) {
  const { state } = useCart();
  const pathname = usePathname();

  // Le panier est visible uniquement sur la page d'accueil et s'il contient des articles
  const isCartVisible = pathname === '/' && Object.keys(state.items).length > 0;

  return (
    <div className="transition-all duration-300">
      {children}
    </div>
  );
}
