import { GraphQLClient } from 'graphql-request';

export function createShopifyClient() {
  const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!shopifyDomain || !accessToken) {
    throw new Error('Missing Shopify configuration');
  }

  const endpoint = `https://${shopifyDomain}/admin/api/2024-01/graphql.json`;

  const client = new GraphQLClient(endpoint, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  });

  return client;
}
