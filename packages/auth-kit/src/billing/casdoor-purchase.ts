import type {
  BillingActionExecutionResult,
  BillingCasdoorBuyProductRequest,
  BillingCasdoorBuyProductResponse,
  BillingCasdoorErrorPayload,
  BillingCasdoorProductDetail,
  BillingCasdoorProviderOption,
  BillingPurchaseRequest,
} from './types';

export interface NormalizedCasdoorProductId {
  owner: string;
  name: string;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractString(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value : undefined;
}

function parseCasdoorErrorPayload(message: string | undefined): BillingCasdoorErrorPayload | undefined {
  if (!isNonEmptyString(message)) {
    return undefined;
  }

  const trimmed = message.trim();
  if (!trimmed.startsWith('{')) {
    return { message: trimmed };
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!isRecord(parsed)) {
      return { message: trimmed };
    }

    const detail = isRecord(parsed.detail)
      ? {
          ...parsed.detail,
          field: extractString(parsed.detail.field),
          value: extractString(parsed.detail.value),
          issue: extractString(parsed.detail.issue),
          location: extractString(parsed.detail.location),
        }
      : undefined;

    return {
      ...parsed,
      code: extractString(parsed.code),
      message: extractString(parsed.message) ?? extractString(parsed.msg) ?? extractString(detail?.issue) ?? trimmed,
      detail,
    };
  } catch {
    return { message: trimmed };
  }
}

export function readBuyProductRedirectTo(value: unknown): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  for (const key of ['redirectTo', 'redirectUrl', 'redirect_url', 'url', 'href', 'location']) {
    const candidate = value[key];
    if (isNonEmptyString(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

export function normalizeCasdoorProductId(id: string): NormalizedCasdoorProductId {
  const [owner, ...rest] = id.split('/');
  const name = rest.join('/');

  if (!isNonEmptyString(owner) || !isNonEmptyString(name)) {
    throw new Error(`Invalid Casdoor product id: ${id}`);
  }

  return { owner, name };
}

function chooseProviderFromObjects(
  providerObjs: BillingCasdoorProviderOption[] | undefined,
  preferredProviderName?: string,
): string | undefined {
  if (isNonEmptyString(preferredProviderName)) {
    return preferredProviderName;
  }

  return providerObjs?.find((provider) => isNonEmptyString(provider.name))?.name;
}

export function chooseCasdoorProviderName(
  product: Pick<BillingCasdoorProductDetail, 'providers' | 'providerObjs'>,
  preferredProviderName?: string,
): string {
  if (isNonEmptyString(preferredProviderName)) {
    return preferredProviderName;
  }

  const fromProviders = product.providers?.find(isNonEmptyString);
  if (fromProviders) {
    return fromProviders;
  }

  const fromProviderObjs = chooseProviderFromObjects(product.providerObjs, preferredProviderName);
  if (fromProviderObjs) {
    return fromProviderObjs;
  }

  throw new Error('No providerName available for Casdoor buy-product request.');
}

export function buildCasdoorBuyProductParams(
  input: BillingCasdoorBuyProductRequest,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set('id', input.id);
  params.set('providerName', input.providerName);
  params.set('pricingName', input.pricingName ?? '');
  params.set('planName', input.planName ?? '');
  params.set('userName', input.userName ?? '');
  params.set('paymentEnv', input.paymentEnv ?? '');
  params.set('customPrice', String(input.customPrice ?? 0));
  return params;
}

export function buildCasdoorBuyProductRequest(
  purchase: BillingPurchaseRequest,
  product: BillingCasdoorProductDetail,
  preferredProviderName?: string,
): BillingCasdoorBuyProductRequest {
  const providerName = chooseCasdoorProviderName(product, purchase.providerName ?? preferredProviderName);
  const productId = `${product.owner}/${product.name}`;

  return {
    id: productId,
    providerName,
    pricingName: purchase.pricingName ?? '',
    planName: purchase.planName ?? '',
    userName: purchase.userName ?? '',
    paymentEnv: purchase.paymentEnv ?? '',
    customPrice: purchase.customPrice ?? 0,
  };
}

function normalizeCasdoorBuyProductStatus(status: string | undefined): 'succeeded' | 'pending' | 'failed' {
  const statusText = typeof status === 'string' ? status.toLowerCase() : '';
  if (statusText.includes('error') || statusText.includes('fail') || statusText.includes('cancel')) {
    return 'failed';
  }
  if (statusText.includes('pend') || statusText.includes('require')) {
    return 'pending';
  }
  return 'succeeded';
}

export function normalizeCasdoorBuyProductResponse(
  response: BillingCasdoorBuyProductResponse,
  fallbackRedirectTo?: string,
): BillingActionExecutionResult {
  const errorPayload = parseCasdoorErrorPayload(response.msg);
  const redirectTo =
    readBuyProductRedirectTo(response.data) ??
    readBuyProductRedirectTo(response.data2) ??
    readBuyProductRedirectTo(response.data3) ??
    fallbackRedirectTo;
  const status = normalizeCasdoorBuyProductStatus(response.status);

  if (status === 'failed') {
    return {
      status,
      redirectTo,
      message: errorPayload?.message ?? response.msg ?? 'Casdoor buy-product failed.',
      errorCode: errorPayload?.code,
      rawResult: response,
    };
  }

  return {
    status,
    redirectTo,
    rawResult: response,
  };
}
