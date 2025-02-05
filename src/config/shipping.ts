export interface WeightBasedRate {
  maxWeight: number;  // en kg
  price: string;
}

export interface PriceBasedShipping {
  minOrderValue: number;
  price: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  carrier: string;
  basePrice: string;
  weightRates: WeightBasedRate[];
  freeShippingThreshold?: number;
  priceRates: PriceBasedShipping[];
  restrictions?: {
    maxWeight?: number;
    excludedPostalCodes?: string[];
    excludedCountries?: string[];
  };
}

// Configuration des méthodes d'expédition
export const SHIPPING_METHODS: { [key: string]: ShippingMethod } = {
  'colissimo-fr': {
    id: 'colissimo-fr',
    name: 'Colissimo',
    carrier: 'Colissimo',
    basePrice: '8.00',
    weightRates: [
      { maxWeight: 0.5, price: '8.00' },
      { maxWeight: 1, price: '9.50' },
      { maxWeight: 2, price: '11.00' },
      { maxWeight: 5, price: '14.50' },
      { maxWeight: 10, price: '20.50' },
      { maxWeight: 20, price: '26.95' },
    ],
    priceRates: [],
    restrictions: {
      maxWeight: 20,
      excludedCountries: ['BE', 'LU', 'DE', 'IT', 'ES']
    }
  },
  'mondial-relay': {
    id: 'mondial-relay',
    name: 'Mondial Relay',
    carrier: 'Mondial Relay',
    basePrice: '4.00',
    weightRates: [
      { maxWeight: 0.5, price: '4.00' },
      { maxWeight: 1, price: '4.90' },
      { maxWeight: 2, price: '6.00' },
      { maxWeight: 5, price: '7.50' },
      { maxWeight: 10, price: '9.90' },
      { maxWeight: 20, price: '14.90' },
    ],
    priceRates: [],
    restrictions: {
      maxWeight: 20,
      excludedCountries: ['BE', 'LU', 'DE', 'IT', 'ES']
    }
  },
  'colissimo-eu': {
    id: 'colissimo-eu',
    name: 'Colissimo Europe',
    carrier: 'Colissimo',
    basePrice: '12.00',
    weightRates: [
      { maxWeight: 0.5, price: '12.00' },
      { maxWeight: 1, price: '14.50' },
      { maxWeight: 2, price: '17.00' },
      { maxWeight: 5, price: '23.50' },
      { maxWeight: 10, price: '32.90' },
      { maxWeight: 20, price: '44.90' },
    ],
    priceRates: [],
    restrictions: {
      maxWeight: 20,
      excludedCountries: ['FR']
    }
  }
};
