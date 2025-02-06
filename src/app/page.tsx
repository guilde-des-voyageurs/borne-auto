import { getProducts } from '@/utils/shopify';
import SalesTunnel from '@/components/SalesTunnel';

export default async function Home() {
  const { products } = await getProducts();

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#999' }}>
      <div className="py-8">
        <h1 className="text-4xl font-bold text-center mb-12 text-white">Runes de Chêne</h1>
        <div className="max-w-[1920px] mx-auto px-4">
          <SalesTunnel products={products} />
        </div>
      </div>
    </main>
  );
}