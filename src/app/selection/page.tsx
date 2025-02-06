import { getProducts } from '@/utils/shopify';
import SelectionContent from '@/components/SelectionContent';

export default async function SelectionPage() {
  const { products } = await getProducts();
  return <SelectionContent products={products} />;
}
