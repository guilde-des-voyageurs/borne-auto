import { NextRequest } from 'next/server';

export type DynamicRouteHandler = (
  req: NextRequest,
  context: {
    params: Record<string, string | string[]>;
  }
) => Promise<Response>;
