import { NextResponse } from 'next/server';

import { resolvePublicOrigin } from '../core/origin';
import { buildBillingPaymentCallbackContext } from './runtime';
import type {
  BillingPaymentRouteBaseOptions,
  BillingPaymentFinishedRouteOptions,
  BillingPaymentFinishedContext,
  BillingPaymentFinishedHandler,
  BillingPaymentSuccessContext,
  BillingPaymentSuccessHandlerResult,
  BillingPaymentSuccessRouteOptions,
} from './types';

export interface BillingPaymentRouteOptions extends BillingPaymentRouteBaseOptions {
  routePath: string;
  missingHandlerFile: string;
  handler?: BillingPaymentSuccessRouteOptions['handler'] | BillingPaymentFinishedRouteOptions['handler'];
  phase?: 'success' | 'failure' | 'finished';
}

function sanitizeRedirectPath(value: string | null | undefined, fallback: string): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return fallback;
  }

  return value;
}

function isDebugEnabled(): boolean {
  const value = process.env.BILLING_PAYMENT_SUCCESS_DEBUG;
  if (!value) {
    return false;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function resolveRedirectTarget(
  result: BillingPaymentSuccessHandlerResult | undefined,
  context: BillingPaymentSuccessContext,
  fallbackRedirect: string,
): string {
  if (typeof result === 'string') {
    return sanitizeRedirectPath(result, fallbackRedirect);
  }

  if (result && typeof result === 'object' && 'redirectTo' in result) {
    return sanitizeRedirectPath(result.redirectTo ?? null, fallbackRedirect);
  }

  return sanitizeRedirectPath(context.redirectTo, fallbackRedirect);
}

function resolveFallbackTarget(fallbackRedirect: string): string {
  return sanitizeRedirectPath(fallbackRedirect, '/');
}

function logMissingPaymentHandler(
  context: BillingPaymentSuccessContext,
  fallbackRedirect: string,
  missingHandlerFile: string,
  routePath: string,
): void {
  console.warn(
    `[casdoor-next-auth-kit] default billing handler at ${missingHandlerFile} has no business logic. ` +
      `Edit this file to handle ${routePath} with order/payment enrichment before redirecting. ` +
      `Falling back to ${fallbackRedirect}.`,
    {
      paymentOwner: context.paymentOwner,
      paymentName: context.paymentName,
      paymentId: context.paymentId,
      orderId: context.orderId,
      params: context.params,
    },
  );
}

export async function createBillingPaymentRouteResponse(
  request: Request,
  options: BillingPaymentRouteOptions,
) {
  const origin = resolvePublicOrigin(request, options.appUrl);
  const fallbackRedirect = options.fallbackRedirect ?? '/';
  const context = await buildBillingPaymentCallbackContext(request, options.phase);

  if (isDebugEnabled()) {
    console.info(`[casdoor-next-auth-kit] ${options.routePath} request`, {
      method: request.method,
      path: context.url.pathname,
      query: context.params,
      body: context.body,
    });
  }

  try {
    if (options.handler) {
      const handler = options.handler;
      const result =
        options.phase === 'finished'
          ? await (handler as BillingPaymentFinishedHandler)(context as BillingPaymentFinishedContext)
          : await (handler as NonNullable<BillingPaymentSuccessRouteOptions['handler']>)(context);
      if (result instanceof Response) {
        return result;
      }

      const target = resolveRedirectTarget(result, context, fallbackRedirect);
      return NextResponse.redirect(new URL(target, origin), 307);
    }

    logMissingPaymentHandler(context, fallbackRedirect, options.missingHandlerFile, options.routePath);
    const target = resolveFallbackTarget(fallbackRedirect);
    return NextResponse.redirect(new URL(target, origin), 307);
  } catch (error) {
    console.error(`[casdoor-next-auth-kit] ${options.routePath} handler failed:`, error);
    return new NextResponse('Billing payment handler failed', { status: 500 });
  }
}
