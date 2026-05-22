import type { BillingCasdoorProductDetail, BillingCasdoorProviderOption } from './types.ts';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export interface NormalizedCasdoorProductId {
  owner: string;
  name: string;
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
