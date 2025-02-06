class ShopifyAdmin {
  private baseUrl: string;
  private accessToken: string;

  constructor() {
    const storeUrl = process.env.SHOPIFY_STORE_URL;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!storeUrl || !accessToken) {
      throw new Error('Missing Shopify credentials');
    }

    this.baseUrl = `https://${storeUrl}/admin/api/2024-01`;
    this.accessToken = accessToken;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': this.accessToken,
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    return response;
  }

  async get(endpoint: string): Promise<Response> {
    return this.request(endpoint, {
      method: 'GET'
    });
  }

  async post(endpoint: string, data: object): Promise<Response> {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint: string, data: object): Promise<Response> {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint: string): Promise<Response> {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

export const shopifyAdmin = new ShopifyAdmin();
