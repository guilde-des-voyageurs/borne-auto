'use client';

import { useState } from 'react';

interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  postalCode: string;
  country: string;
  acceptsMarketing: boolean;
}

interface CartSummaryModalProps {
  onClose: () => void;
  onSubmit: (customer: Customer) => void;
}

export default function CartSummaryModal({ onClose, onSubmit }: CartSummaryModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Customer>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    city: '',
    postalCode: '',
    country: 'FR',
    acceptsMarketing: false,
  });

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const isFormDataValid = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.address1.trim() !== '' &&
      formData.city.trim() !== '' &&
      formData.postalCode.trim() !== '' &&
      formData.country.trim() !== ''
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!isFormDataValid()) {
        alert("Veuillez remplir tous les champs obligatoires");
        setLoading(false);
        return;
      }

      await onSubmit(formData);

      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Résumé de votre commande</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {/* Add items here */}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Sous-total :</span>
              <span>0.00 €</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Remise (0%) :</span>
              <span>-0.00 €</span>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleFormDataChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleFormDataChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormDataChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleFormDataChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Adresse
              </label>
              <input
                type="text"
                name="address1"
                value={formData.address1}
                onChange={handleFormDataChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ville
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleFormDataChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Code postal
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleFormDataChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pays
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleFormDataChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="FR">France</option>
                <option value="BE">Belgique</option>
                <option value="CH">Suisse</option>
                <option value="LU">Luxembourg</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="acceptsMarketing"
                checked={formData.acceptsMarketing}
                onChange={handleFormDataChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Je souhaite recevoir les actualités et offres par email
              </label>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {loading ? 'Création...' : 'Créer la commande'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
