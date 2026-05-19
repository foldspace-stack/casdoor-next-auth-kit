import type { BillingPaymentFinishedHandler, BillingPaymentFinishedRouteOptions } from './types';
import { createBillingPaymentRouteResponse } from './payment-route';

export async function createBillingPaymentFinishedResponse(
  request: Request,
  options: BillingPaymentFinishedRouteOptions = {},
) {
  return createBillingPaymentRouteResponse(request, {
    ...options,
    routePath: '/auth/payment/finished',
    missingHandlerFile: 'lib/billing/payment-finished.ts',
    fallbackRedirect: options.fallbackRedirect ?? '/',
  });
}

export function createBillingPaymentFinishedRouteHandler(options: BillingPaymentFinishedRouteOptions = {}) {
  return async function GET(request: Request) {
    return createBillingPaymentFinishedResponse(request, options);
  };
}

export type { BillingPaymentFinishedHandler };
