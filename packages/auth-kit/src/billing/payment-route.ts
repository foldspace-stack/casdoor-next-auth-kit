import { NextResponse } from 'next/server';

import { resolvePublicOrigin } from '../core/origin';
import type {
  BillingPaymentSuccessContext,
  BillingPaymentSuccessHandlerResult,
  BillingPaymentSuccessRouteOptions,
} from './types';

export interface BillingPaymentRouteOptions extends BillingPaymentSuccessRouteOptions {
  routePath: string;
  missingHandlerName: string;
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

async function readRequestBody(request: Request): Promise<unknown> {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return null;
  }

  const rawBody = await request.clone().text();
  if (!rawBody) {
    return null;
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(rawBody);
    } catch {
      return rawBody;
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(rawBody).entries());
  }

  return rawBody;
}

async function buildContext(request: Request): Promise<BillingPaymentSuccessContext> {
  const url = new URL(request.url);
  const params: Record<string, string> = {};

  for (const [key, value] of url.searchParams.entries()) {
    params[key] = value;
  }

  return {
    request,
    url,
    searchParams: url.searchParams,
    params,
    paymentId: url.searchParams.get('paymentId'),
    orderId: url.searchParams.get('orderId'),
    redirectTo: url.searchParams.get('redirect') ?? url.searchParams.get('returnTo'),
    body: await readRequestBody(request),
  };
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
  missingHandlerName: string,
  routePath: string,
): void {
  console.warn(
    `[casdoor-next-auth-kit] ${missingHandlerName} is not configured. ` +
      `Set it in .env to handle ${routePath} with order/payment enrichment before redirecting. ` +
      `Falling back to ${fallbackRedirect}.`,
    {
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
  const context = await buildContext(request);

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
      const result = await options.handler(context);
      if (result instanceof Response) {
        return result;
      }

      const target = resolveRedirectTarget(result, context, fallbackRedirect);
      return NextResponse.redirect(new URL(target, origin), 307);
    }

    logMissingPaymentHandler(context, fallbackRedirect, options.missingHandlerName, options.routePath);
    const target = resolveFallbackTarget(fallbackRedirect);
    return NextResponse.redirect(new URL(target, origin), 307);
  } catch (error) {
    console.error(`[casdoor-next-auth-kit] ${options.routePath} handler failed:`, error);
    return new NextResponse('Billing payment handler failed', { status: 500 });
  }
}
