import type {
  BillingActionPayload,
  BillingCatalogConfig,
  BillingCreditsState,
  BillingEntitlementState,
  BillingInterval,
  BillingItem,
  BillingOrderHistoryItem,
  BillingPaymentHistoryItem,
  BillingProductSnapshot,
  BillingProductState,
  BillingPurchaseStatus,
  BillingRuntimeConfig,
  BillingSubscriptionHistoryItem,
  BillingSubscriptionState,
} from './types';

export function normalizeBillingRuntimeConfig(config?: Partial<BillingRuntimeConfig> | null): BillingRuntimeConfig {
  return {
    catalogKey: config?.catalogKey ?? 'default',
    items: config?.items ?? [],
    conversionRules: config?.conversionRules ?? [],
    defaults: config?.defaults ?? {},
  };
}

export function normalizeBillingCatalogConfig(config?: Partial<BillingCatalogConfig> | null): BillingCatalogConfig {
  return {
    ...normalizeBillingRuntimeConfig(config),
    title: config?.title,
    description: config?.description,
    portalPath: config?.portalPath,
    successPath: config?.successPath,
    cancelPath: config?.cancelPath,
  };
}

export function resolveBillingItem(items: BillingItem[] | undefined, key?: string | null): BillingItem | undefined {
  if (!key) return undefined;
  return items?.find((item) => item.key === key || item.backendRef.productId === key || item.backendRef.planId === key);
}

export function resolveBillingSubscriptionProduct(
  subscription: BillingSubscriptionState | undefined,
  runtimeConfig: BillingRuntimeConfig | undefined,
): BillingProductSnapshot | undefined {
  if (!subscription) return undefined;
  if (subscription.product) return subscription.product;

  const item = resolveBillingItem(runtimeConfig?.items, subscription.planKey ?? subscription.subscriptionId);
  if (!item) return undefined;

  return {
    productKey: item.key,
    productId: item.backendRef.productId,
    title: item.title,
    kind: item.kind,
    planId: item.backendRef.planId,
    priceId: item.backendRef.priceId,
    interval: item.interval,
    creditGrant: item.creditGrant,
    creditRedeem: item.creditRedeem,
    metadata: item.metadata,
  };
}

export function resolveBillingProductSnapshot(item?: BillingItem | null): BillingProductSnapshot | undefined {
  if (!item) return undefined;
  return {
    productKey: item.key,
    productId: item.backendRef.productId,
    title: item.title,
    kind: item.kind,
    planId: item.backendRef.planId,
    priceId: item.backendRef.priceId,
    interval: item.interval,
    creditGrant: item.creditGrant,
    creditRedeem: item.creditRedeem,
    metadata: item.metadata,
  };
}

export function deriveBillingCreditsState(
  credits?: BillingCreditsState | null,
  products?: BillingProductState[] | null,
  conversionRules?: BillingRuntimeConfig['conversionRules'],
): BillingCreditsState {
  if (credits) return credits;

  const fromProducts = products?.reduce((total, product) => {
    if (typeof product.creditsBalance === 'number') {
      return total + Number(product.creditsBalance);
    }

    if (!product.creditGrant) {
      return total;
    }

    const quantity = Number(product.quantity ?? 1);
    return total + Number(product.creditGrant.creditsPerUnit || 0) * quantity;
  }, 0);

  const fromRules = conversionRules?.reduce((total, rule) => {
    if (rule.kind !== 'grant-credits') return total;
    return total + Number(rule.creditsPerUnit || 0);
  }, 0);

  return {
    balance: Number(fromProducts ?? fromRules ?? 0),
  };
}

export function deriveBillingEntitlements(
  subscription: BillingSubscriptionState | undefined,
  products: BillingProductState[] | undefined,
  credits: BillingCreditsState | undefined,
  runtimeConfig: BillingRuntimeConfig | undefined,
): BillingEntitlementState {
  const features = new Set<string>();
  const limits: Record<string, number> = {};
  const flags: Record<string, boolean> = {};
  const creditBalance = credits?.balance ?? 0;

  for (const item of runtimeConfig?.items ?? []) {
    for (const feature of item.features ?? []) {
      features.add(feature);
    }
    if (item.metadata?.tier) {
      flags[item.metadata.tier] = true;
    }
  }

  if (subscription?.status === 'active' || subscription?.status === 'trialing') {
    flags.subscribed = true;
  }

  if (creditBalance > 0) {
    flags.hasCredits = true;
    limits.credits = creditBalance;
  }

  for (const product of products ?? []) {
    if (product.owned) {
      flags[`product:${product.productKey}`] = true;
    }
  }

  return {
    features: [...features],
    limits,
    flags,
  };
}

export function normalizeBillingPurchaseStatus(
  status?: Partial<BillingPurchaseStatus> | null,
  order?: BillingOrderHistoryItem | null,
  payment?: BillingPaymentHistoryItem | null,
): BillingPurchaseStatus {
  if (status) {
    return {
      actionKey: status.actionKey,
      orderId: status.orderId,
      paymentId: status.paymentId,
      transactionId: status.transactionId,
      status: status.status ?? 'idle',
      orderStatus: status.orderStatus,
      paymentStatus: status.paymentStatus,
      transactionStatus: status.transactionStatus,
      redirectTo: status.redirectTo,
      updatedAt: status.updatedAt,
    };
  }

  const orderStatus = order?.status;
  const paymentStatus = payment?.status;
  const normalizedStatus =
    paymentStatus === 'paid' || orderStatus === 'paid'
      ? 'paid'
      : paymentStatus === 'pending' || orderStatus === 'pending'
        ? 'pending'
        : paymentStatus === 'failed' || orderStatus === 'failed'
          ? 'failed'
          : paymentStatus === 'canceled' || orderStatus === 'canceled'
            ? 'canceled'
            : paymentStatus === 'refunded' || orderStatus === 'refunded'
              ? 'refunded'
              : paymentStatus === 'pending'
                ? 'requires_payment'
                : 'idle';

  return {
    actionKey: order?.orderId ?? payment?.paymentId,
    orderId: order?.orderId,
    paymentId: payment?.paymentId,
    transactionId: payment?.transactionId ?? order?.transactionId,
    status: normalizedStatus,
    orderStatus,
    paymentStatus,
    transactionStatus: payment?.transactionId ? 'linked' : undefined,
    updatedAt: payment?.updatedAt ?? order?.updatedAt,
  };
}

export function resolveBillingInterval(interval?: BillingInterval | null): BillingInterval | undefined {
  return interval === 'month' || interval === 'year' ? interval : undefined;
}

export function buildBillingActionPayload(
  payload: BillingActionPayload,
  runtimeConfig?: BillingRuntimeConfig | null,
): BillingActionPayload {
  const config = normalizeBillingRuntimeConfig(runtimeConfig);
  const item = resolveBillingItem(config.items, payload.key) ?? resolveBillingItem(config.items, payload.productId);

  if (payload.kind === 'subscribe' && item) {
    return {
      ...payload,
      subscriptionConfig: payload.subscriptionConfig ?? {
        productKey: item.key,
        productId: item.backendRef.productId,
        planId: item.backendRef.planId,
        priceId: item.backendRef.priceId,
        interval: item.interval ?? config.defaults?.defaultInterval,
        quantity: payload.quantity ?? config.defaults?.defaultQuantity,
        metadata: item.metadata,
      },
    };
  }

  if ((payload.kind === 'purchase' || payload.kind === 'manage' || payload.kind === 'upgrade' || payload.kind === 'cancel') && item) {
    return {
      ...payload,
      productConfig: payload.productConfig ?? {
        productKey: item.key,
        productId: item.backendRef.productId,
        priceId: item.backendRef.priceId,
        quantity: payload.quantity ?? config.defaults?.defaultQuantity,
        creditGrant: item.creditGrant,
        creditRedeem: item.creditRedeem,
        metadata: item.metadata,
      },
    };
  }

  return payload;
}
