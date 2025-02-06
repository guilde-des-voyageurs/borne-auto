import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from '../context/CartContext';
import Cart from '../components/Cart';
import MainContainer from '../components/MainContainer';

export const metadata: Metadata = {
  title: "Borne Auto",
  description: "Borne de commande auto",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        <CartProvider>
          <MainContainer>
            <div className="flex">
              <main className="flex-1 min-h-screen">
                {children}
              </main>
            </div>
          </MainContainer>
          <Cart />
        </CartProvider>
      </body>
    </html>
  )
}
