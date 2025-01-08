export async function getShippingProfiles() {
  try {
    const response = await fetch('/api/shipping-profiles');

    if (!response.ok) {
      throw new Error('Failed to fetch shipping profiles');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching shipping profiles:', error);
    return [];
  }
}
