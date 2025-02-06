import { getProducts } from '@/utils/shopify';
import SalesTunnel from '@/components/SalesTunnel';
import SelectionLayout from '@/components/SelectionLayout';

export default async function SelectionPage() {
  const { products } = await getProducts();

  return (
    <SelectionLayout>
      <SalesTunnel products={products} />
    </SelectionLayout>
  );
}
