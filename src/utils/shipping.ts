export interface ShippingMethod {
  id: string;
  title: string;
  price: string;
  estimated_days: string;
}

export const shippingMethods: ShippingMethod[] = [
  {
    id: 'colissimo',
    title: 'Colissimo',
    price: '5.95',
    estimated_days: '2-3 jours ouvrés'
  },
  {
    id: 'shop2shop',
    title: 'Relais Colis Shop2Shop',
    price: '4.95',
    estimated_days: '3-5 jours ouvrés'
  }
];
