import type { BillingPaymentSuccessHandler, BillingPaymentSuccessRouteOptions } from '../shared/types.ts';
import { createBillingPaymentRouteResponse } from './payment-route.ts';

export async function createBillingPaymentSuccessResponse(
  request: Request,
  options: BillingPaymentSuccessRouteOptions = {},
) {
  return createBillingPaymentRouteResponse(request, {
    ...options,
    routePath: '/auth/payment/success',
    missingHandlerFile: 'app/(auth-kit)/billing/payment-success.ts',
    fallbackRedirect: options.fallbackRedirect ?? '/auth/payment/finished',
    phase: options.phase ?? 'success',
  });
}

export function createBillingPaymentSuccessRouteHandler(options: BillingPaymentSuccessRouteOptions = {}) {
  return async function GET(request: Request) {
    return createBillingPaymentSuccessResponse(request, options);
  };
}

export type { BillingPaymentSuccessHandler };
