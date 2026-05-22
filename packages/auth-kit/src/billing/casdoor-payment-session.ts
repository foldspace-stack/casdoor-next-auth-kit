import {
  buildCasdoorBuyProductParams,
  buildCasdoorBuyProductRequest,
  normalizeCasdoorBuyProductResponse,
} from './casdoor-purchase.ts';
import { normalizeCasdoorProductId } from './casdoor-helpers.ts';
import type {
  BillingCasdoorApiResponse,
  BillingCasdoorBuyProductResponse,
  BillingCasdoorCheckoutSession,
  BillingCasdoorPaymentDetail,
  BillingCasdoorPaymentLookupInput,
  BillingCasdoorPaymentNormalizedState,
  BillingCasdoorProductCheckoutInput,
  BillingCasdoorProductDetail,
  BillingCasdoorProductResponse,
  BillingCasdoorRequestAuth,
} from './types.ts';

export type BillingFetch = typeof fetch;

interface FetchableRequest {
  fetcher?: BillingFetch;
}

type FetchableCheckoutInput = BillingCasdoorProductCheckoutInput & FetchableRequest;
type FetchablePaymentInput = BillingCasdoorPaymentLookupInput & FetchableRequest;

function getFetch(input?: FetchableRequest): BillingFetch {
  return input?.fetcher ?? fetch;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

export function resolveCasdoorServerOrigin(requestUrl: string): string {
  const configured = process.env.NEXT_PUBLIC_CASDOOR_SERVER_URL?.trim();
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      return configured.replace(/\/+$/, '');
    }
  }

  return new URL(requestUrl).origin;
}

export function buildCasdoorProxyUrl(requestUrl: string, pathname: string): URL {
  return new URL(pathname, requestUrl);
}

export function buildCasdoorCheckoutUrl(requestUrl: string, pathname: string): URL {
  return new URL(pathname, resolveCasdoorServerOrigin(requestUrl));
}

export function buildCasdoorRequestHeaders(input: BillingCasdoorRequestAuth): Headers {
  const headers = new Headers({
    accept: 'application/json',
    'accept-language': 'zh-CN,zh;q=0.9',
    'x-requested-with': 'XMLHttpRequest',
    origin: new URL(input.requestUrl).origin,
    referer: input.requestUrl,
  });

  if (input.cookieHeader) {
    headers.set('cookie', input.cookieHeader);
  }

  if (input.accessToken) {
    headers.set('authorization', `Bearer ${input.accessToken}`);
  }

  return headers;
}

export async function readCasdoorJsonResponse<T>(response: Response): Promise<T> {
  const body = await response.text();
  if (!body) {
    throw new Error('Casdoor returned an empty response.');
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error('Casdoor returned a non-JSON response.');
  }
}

export function buildCasdoorQrCodeUrl(targetUrl: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=480x480&data=${encodeURIComponent(targetUrl)}`;
}

function normalizePaymentId(paymentId: string, paymentOwner?: string): string {
  const trimmed = paymentId.trim();
  if (!trimmed) {
    throw new Error('Invalid Casdoor payment id: empty value');
  }

  if (trimmed.includes('/')) {
    return trimmed;
  }

  if (paymentOwner?.trim()) {
    return `${paymentOwner.trim()}/${trimmed}`;
  }

  return trimmed;
}

function buildSuccessUrl(input: BillingCasdoorProductCheckoutInput): string {
  const successPath = input.returnUrl || input.callbackUrl || '/auth/payment/success';
  const successUrl = new URL(successPath, input.requestUrl);
  successUrl.searchParams.set('orderId', input.orderRef);
  if (input.orderCode) {
    successUrl.searchParams.set('orderCode', input.orderCode);
  }
  return successUrl.toString();
}

function buildPaymentPageUrl(
  input: BillingCasdoorProductCheckoutInput,
  payment: BillingCasdoorPaymentDetail,
  providerName: string,
): {
  paymentOwner: string;
  paymentName: string;
  checkoutUrl: string;
  successUrl: string;
  payUrl?: string;
} {
  const product = normalizeCasdoorProductId(input.productId);
  const paymentOwner = payment.owner || product.owner;
  const paymentName = payment.name || payment.outOrderId || input.orderRef;
  const successUrl = buildSuccessUrl(input);
  const checkoutUrl = buildCasdoorCheckoutUrl(input.requestUrl, `/qrcode/${paymentOwner}/${paymentName}`);
  checkoutUrl.searchParams.set('providerName', providerName);
  checkoutUrl.searchParams.set('successUrl', successUrl);
  if (payment.payUrl) {
    checkoutUrl.searchParams.set('payUrl', payment.payUrl);
  }

  return {
    paymentOwner,
    paymentName,
    checkoutUrl: checkoutUrl.toString(),
    successUrl,
    payUrl: payment.payUrl,
  };
}

function readPaymentRecord(value: unknown): BillingCasdoorPaymentDetail | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const owner = readString(value.owner);
  const name = readString(value.name);
  if (!owner || !name) {
    return undefined;
  }

  return value as BillingCasdoorPaymentDetail;
}

export function normalizeCasdoorPaymentState(state?: string | null): BillingCasdoorPaymentNormalizedState {
  const value = typeof state === 'string' ? state.trim().toLowerCase() : '';
  if (!value) {
    return 'unknown';
  }

  if (value.includes('paid') || value.includes('success') || value.includes('succeeded')) {
    return 'paid';
  }

  if (value.includes('created') || value.includes('pend') || value.includes('require') || value.includes('process')) {
    return 'pending';
  }

  if (value.includes('fail') || value.includes('cancel') || value.includes('error') || value.includes('timeout')) {
    return 'failed';
  }

  return 'unknown';
}

export function isCasdoorPaidState(state?: string | null): boolean {
  return normalizeCasdoorPaymentState(state) === 'paid';
}

export async function createCasdoorProductCheckoutSession(
  input: FetchableCheckoutInput,
): Promise<BillingCasdoorCheckoutSession> {
  const fetcher = getFetch(input);
  const normalizedProduct = normalizeCasdoorProductId(input.productId);
  const headers = buildCasdoorRequestHeaders(input);

  const productUrl = buildCasdoorProxyUrl(input.requestUrl, '/auth/api/get-product');
  productUrl.searchParams.set('id', `${normalizedProduct.owner}/${normalizedProduct.name}`);

  const productResponse = await fetcher(productUrl, { method: 'GET', headers });
  const productPayload = (await readCasdoorJsonResponse<BillingCasdoorProductResponse>(productResponse)) as BillingCasdoorProductResponse;
  const productStatus = productPayload.status.trim().toLowerCase();
  if (productStatus !== 'ok' || !productPayload.data) {
    throw new Error(productPayload.msg || `Failed to load Casdoor product ${input.productId}.`);
  }

  const product = productPayload.data as BillingCasdoorProductDetail;
  const buyRequest = buildCasdoorBuyProductRequest(
    {
      kind: 'product',
      key: input.productId,
      productId: input.productId,
      providerName: input.providerName,
      pricingName: input.pricingName,
      planName: input.planName,
      userName: input.userName,
      paymentEnv: input.paymentEnv,
      customPrice: input.customPrice,
      quantity: 1,
      returnTo: input.returnUrl ?? input.callbackUrl,
      metadata: undefined,
    },
    product,
    input.providerName,
  );

  const buyUrl = buildCasdoorProxyUrl(input.requestUrl, '/auth/api/buy-product');
  for (const [key, value] of buildCasdoorBuyProductParams(buyRequest).entries()) {
    buyUrl.searchParams.set(key, value);
  }

  const buyResponse = await fetcher(buyUrl, { method: 'POST', headers });
  const buyPayload = (await readCasdoorJsonResponse<BillingCasdoorBuyProductResponse>(buyResponse)) as BillingCasdoorBuyProductResponse;
  const normalized = normalizeCasdoorBuyProductResponse(buyPayload, buildSuccessUrl(input));
  if (normalized.status === 'failed') {
    throw new Error(normalized.message || buyPayload.msg || `Casdoor buy-product failed for ${input.productId}.`);
  }

  const payment = readPaymentRecord(buyPayload.data);
  const paymentPage = payment
    ? buildPaymentPageUrl(input, payment, buyRequest.providerName)
    : {
        paymentOwner: normalizedProduct.owner,
        paymentName: input.orderRef,
        checkoutUrl: normalized.redirectTo || buildSuccessUrl(input),
        successUrl: buildSuccessUrl(input),
      };

  const paymentSessionId = payment?.name || paymentPage.paymentName;
  const qrTarget = payment?.payUrl || paymentPage.checkoutUrl;

  return {
    provider: input.provider || buyRequest.providerName,
    providerName: buyRequest.providerName,
    providerOrderId: paymentSessionId,
    checkoutUrl: paymentPage.checkoutUrl,
    qrCodeUrl: buildCasdoorQrCodeUrl(qrTarget),
    paymentSessionId,
    paymentOwner: paymentPage.paymentOwner,
    payUrl: payment?.payUrl,
    successUrl: paymentPage.successUrl,
    raw: buyPayload,
  };
}

export async function fetchCasdoorPayment(
  input: FetchablePaymentInput,
): Promise<BillingCasdoorPaymentDetail | null> {
  const fetcher = getFetch(input);
  const paymentId = normalizePaymentId(input.paymentId, input.paymentOwner);
  const url = buildCasdoorProxyUrl(input.requestUrl, '/auth/api/get-payment');
  url.searchParams.set('id', paymentId);

  const response = await fetcher(url, {
    method: 'GET',
    headers: buildCasdoorRequestHeaders(input),
  });
  const payload = (await readCasdoorJsonResponse<BillingCasdoorApiResponse<BillingCasdoorPaymentDetail>>(response)) as BillingCasdoorApiResponse<BillingCasdoorPaymentDetail>;
  if (payload.status.trim().toLowerCase() !== 'ok') {
    return null;
  }

  return payload.data ?? null;
}

export async function notifyCasdoorPayment(
  input: FetchablePaymentInput,
): Promise<BillingCasdoorPaymentDetail | null> {
  const fetcher = getFetch(input);
  const paymentId = normalizePaymentId(input.paymentId, input.paymentOwner);
  const [paymentOwner, paymentName] = paymentId.split('/');
  if (!paymentOwner || !paymentName) {
    throw new Error(`Invalid Casdoor payment id: ${paymentId}`);
  }

  const url = buildCasdoorProxyUrl(input.requestUrl, `/auth/api/notify-payment/${paymentOwner}/${paymentName}`);
  const response = await fetcher(url, {
    method: 'POST',
    headers: buildCasdoorRequestHeaders(input),
  });
  const payload = (await readCasdoorJsonResponse<BillingCasdoorApiResponse<BillingCasdoorPaymentDetail>>(response)) as BillingCasdoorApiResponse<BillingCasdoorPaymentDetail>;
  if (payload.status.trim().toLowerCase() !== 'ok') {
    return null;
  }

  return payload.data ?? null;
}
