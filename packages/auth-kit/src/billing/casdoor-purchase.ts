import type {
  BillingCasdoorBuyProductRequest,
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
