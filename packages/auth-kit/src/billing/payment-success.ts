import type { BillingPaymentSuccessHandler, BillingPaymentSuccessRouteOptions } from './types';
import { createBillingPaymentRouteResponse } from './payment-route';

export async function createBillingPaymentSuccessResponse(
  request: Request,
  options: BillingPaymentSuccessRouteOptions = {},
) {
  return createBillingPaymentRouteResponse(request, {
    ...options,
    routePath: '/auth/payment/success',
    missingHandlerName: 'BILLING_PAYMENT_SUCCESS_HANDLER',
    fallbackRedirect: options.fallbackRedirect ?? '/auth/payment/finished',
  });
}

export function createBillingPaymentSuccessRouteHandler(options: BillingPaymentSuccessRouteOptions = {}) {
  return async function GET(request: Request) {
    return createBillingPaymentSuccessResponse(request, options);
  };
}

export type { BillingPaymentSuccessHandler };
