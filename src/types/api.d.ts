import { NextRequest } from 'next/server';

export interface RouteHandlerContext<TParams = Record<string, string>> {
  params: TParams;
}

export type RouteHandler<TParams = Record<string, string>> = (
  request: NextRequest,
  context: RouteHandlerContext<TParams>
) => Promise<Response> | Response;

export interface DraftOrderParams {
  id: string;
}

export interface ShippingRateParams {
  id: string;
}

export interface ApiResponse<TData = Record<string, unknown>> {
  data?: TData;
  error?: string;
  status?: number;
}
