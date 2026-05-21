import type {
  BillingCatalogConfig,
  BillingDefaults,
  BillingInterval,
  BillingItem,
} from './types';

export interface BillingSubscriptionCatalogItemInput<TSource = unknown> {
  source: TSource;
  key: string;
  title: string;
  description?: string;
  productId: string;
  planId?: string;
  priceId?: string;
  interval?: BillingInterval;
  featured?: boolean;
  badge?: string;
  priceLabel?: string;
  priceValue?: number;
  features?: string[];
  metadata?: Record<string, string>;
}

export interface BillingSubscriptionCatalogBuilderOptions<TSource = unknown> {
  catalogKey: string;
  title?: string;
  description?: string;
  portalPath?: string;
  successPath?: string;
  cancelPath?: string;
  purchasableIds?: string[];
  defaults?: BillingDefaults;
  mapPlan: (plan: TSource, index: number) => BillingSubscriptionCatalogItemInput<TSource>;
}

export function buildBillingSubscriptionCatalog<TSource>(
  plans: readonly TSource[],
  options: BillingSubscriptionCatalogBuilderOptions<TSource>,
): BillingCatalogConfig {
  const items = plans.map((plan, index) => {
    const mapped = options.mapPlan(plan, index);

    return {
      key: mapped.key,
      kind: 'subscription',
      title: mapped.title,
      description: mapped.description,
      featured: mapped.featured,
      badge: mapped.badge,
      priceLabel: mapped.priceLabel,
      priceValue: mapped.priceValue,
      interval: mapped.interval,
      features: mapped.features,
      backendRef: {
        productId: mapped.productId,
        planId: mapped.planId,
        priceId: mapped.priceId,
      },
      metadata: mapped.metadata,
    } satisfies BillingItem;
  });

  return {
    catalogKey: options.catalogKey,
    title: options.title,
    description: options.description,
    portalPath: options.portalPath,
    successPath: options.successPath,
    cancelPath: options.cancelPath,
    purchasableIds: options.purchasableIds ?? items.map((item) => item.key),
    purchasables: [],
    conversionRules: [],
    defaults: options.defaults ?? {},
    items,
  };
}
