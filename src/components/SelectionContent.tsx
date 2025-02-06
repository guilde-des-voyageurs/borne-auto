'use client';

import SalesTunnel from '@/components/SalesTunnel';
import SelectionLayout from '@/components/SelectionLayout';

interface SelectionContentProps {
  products: any[]; // Utilisez le bon type de vos produits ici
}

export default function SelectionContent({ products }: SelectionContentProps) {
  return (
    <SelectionLayout>
      <SalesTunnel products={products} />
    </SelectionLayout>
  );
}
