import type { BillingPaymentFinishedHandler, BillingPaymentFinishedRouteOptions } from '../shared/types.ts';
import { createBillingPaymentRouteResponse } from './payment-route.ts';

export async function createBillingPaymentFinishedResponse(
  request: Request,
  options: BillingPaymentFinishedRouteOptions = {},
) {
  return createBillingPaymentRouteResponse(request, {
    ...options,
    routePath: '/auth/payment/finished',
    missingHandlerFile: 'app/(auth-kit)/billing/payment-finished.ts',
    fallbackRedirect: options.fallbackRedirect ?? '/',
    phase: options.phase ?? 'finished',
  });
}

export function createBillingPaymentFinishedRouteHandler(options: BillingPaymentFinishedRouteOptions = {}) {
  return async function GET(request: Request) {
    return createBillingPaymentFinishedResponse(request, options);
  };
}

export type { BillingPaymentFinishedHandler };
