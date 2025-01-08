export interface ShippingRate {
  id: string;
  name: string;
  price: string;
}

const EUROPEAN_COUNTRIES = ['BE', 'LU', 'DE', 'IT', 'ES'];

export function getShippingRates(countryCode: string): ShippingRate[] {
  if (countryCode === 'FR') {
    return [
      {
        id: 'colissimo-fr',
        name: 'Colissimo',
        price: '8.00'
      },
      {
        id: 'mondial-relay',
        name: 'Mondial Relay',
        price: '4.00'
      }
    ];
  } else if (EUROPEAN_COUNTRIES.includes(countryCode)) {
    return [
      {
        id: 'colissimo-eu',
        name: 'Colissimo Europe',
        price: '12.00'
      }
    ];
  }
  
  return [];
}
