import { getProducts } from '@/utils/shopify';

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="container mx-auto min-h-screen p-8 bg-white">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Nos Produits</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.products?.map((product: any) => (
          <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow">
            {product.images[0] && (
              <img
                src={product.images[0].src}
                alt={product.title}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            )}
            <h2 className="text-xl font-semibold mt-4 text-gray-800">{product.title}</h2>
            <p className="text-gray-600 mt-2 font-medium">{product.variants[0].price} €</p>
          </div>
        ))}
      </div>
    </main>
  );
}