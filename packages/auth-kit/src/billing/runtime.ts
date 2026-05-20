import type {
  BillingActionPayload,
  BillingCatalogConfig,
  BillingCreditsState,
  BillingEntitlementState,
  BillingInterval,
  BillingItem,
  BillingPurchasableEntry,
  BillingPaymentCallbackContext,
  BillingPurchaseRequest,
  BillingOrderHistoryItem,
  BillingPaymentHistoryItem,
  BillingProductSnapshot,
  BillingProductState,
  BillingPurchaseStatus,
  BillingRuntimeConfig,
  BillingSubscriptionHistoryItem,
  BillingSubscriptionState,
} from './types';

function normalizeCasdoorProductId(id: string): { owner: string; name: string } {
  const [owner, ...rest] = id.split('/');
  const name = rest.join('/');

  if (!owner || !name) {
    throw new Error(`Invalid Casdoor product id: ${id}`);
  }

  return { owner, name };
}

export function normalizeBillingRuntimeConfig(config?: Partial<BillingRuntimeConfig> | null): BillingRuntimeConfig {
  return {
    catalogKey: config?.catalogKey ?? 'default',
    items: config?.items ?? [],
    purchasableIds: config?.purchasableIds ?? [],
    purchasables: config?.purchasables ?? [],
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

function isBillingPurchasableIdMatch(id: string, item: BillingItem | BillingPurchasableEntry): boolean {
  return id === item.key || id === item.backendRef.productId || ('planId' in item.backendRef && id === item.backendRef.planId);
}

export function resolveBillingPurchasable(
  runtimeConfig: BillingRuntimeConfig | undefined,
  key?: string | null,
): BillingPurchasableEntry | undefined {
  if (!runtimeConfig || !key) {
    return undefined;
  }

  const explicit = runtimeConfig.purchasables?.find(
    (item) => item.key === key || item.backendRef.productId === key || ('planId' in item.backendRef && item.backendRef.planId === key),
  );
  if (explicit) {
    return explicit;
  }

  if (runtimeConfig.purchasableIds?.length) {
    const matchingItem = resolveBillingItem(runtimeConfig.items, key);
    if (!matchingItem) {
      return undefined;
    }

    const allowed = runtimeConfig.purchasableIds.some((itemKey) => isBillingPurchasableIdMatch(itemKey, matchingItem));
    if (!allowed) {
      return undefined;
    }
  }

  const item = resolveBillingItem(runtimeConfig.items, key);
  if (!item) {
    return undefined;
  }

  if (item.kind === 'subscription') {
    return {
      key: item.key,
      kind: 'subscription',
      title: item.title,
      description: item.description,
      enabled: true,
      backendRef: {
        productId: item.backendRef.productId,
        planId: item.backendRef.planId,
        priceId: item.backendRef.priceId,
      },
      interval: item.interval,
      hooks: undefined,
    };
  }

  return {
    key: item.key,
    kind: 'product',
    title: item.title,
    description: item.description,
    enabled: true,
    backendRef: {
      productId: item.backendRef.productId,
      priceId: item.backendRef.priceId,
    },
    quantity: undefined,
    creditGrant: item.creditGrant,
    creditRedeem: item.creditRedeem,
    hooks: undefined,
  };
}

export function buildBillingPurchaseRequest(
  payload: BillingActionPayload,
  runtimeConfig?: BillingRuntimeConfig | null,
): BillingPurchaseRequest | null {
  const config = normalizeBillingRuntimeConfig(runtimeConfig);
  const purchasable = resolveBillingPurchasable(config, payload.key) ?? resolveBillingPurchasable(config, payload.productId);
  if (!purchasable) {
    return null;
  }

  let productOwner: string | undefined;
  let productName: string | undefined;
  try {
    const normalized = normalizeCasdoorProductId(purchasable.backendRef.productId);
    productOwner = normalized.owner;
    productName = normalized.name;
  } catch {
    productOwner = undefined;
    productName = undefined;
  }

  return {
    kind: purchasable.kind,
    key: purchasable.key,
    productId: purchasable.backendRef.productId,
    productOwner,
    productName,
    providerName: payload.providerName,
    pricingName: payload.pricingName,
    planName: payload.planName,
    userName: payload.userName,
    paymentEnv: payload.paymentEnv,
    customPrice: payload.customPrice,
    quantity: payload.quantity ?? 1,
    returnTo: payload.returnTo,
    metadata: payload.metadata,
  };
}

export function filterBillingPurchasableItems(
  items: BillingItem[] | undefined,
  runtimeConfig?: BillingRuntimeConfig | null,
): BillingItem[] {
  if (!runtimeConfig) {
    return items ?? [];
  }

  const config = normalizeBillingRuntimeConfig(runtimeConfig);
  if (!config.purchasableIds?.length && !config.purchasables?.length) {
    return items ?? [];
  }

  return (items ?? []).filter((item) => {
    const purchasable = resolveBillingPurchasable(config, item.key);
    return Boolean(purchasable);
  });
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

export async function buildBillingPaymentCallbackContext(
  request: Request,
  phase?: 'success' | 'failure' | 'finished',
): Promise<BillingPaymentCallbackContext> {
  const url = new URL(request.url);
  const params: Record<string, string> = {};

  for (const [key, value] of url.searchParams.entries()) {
    params[key] = value;
  }

  const paymentOwner = url.searchParams.get('paymentOwner') ?? url.searchParams.get('owner');
  const paymentName = url.searchParams.get('paymentName') ?? url.searchParams.get('name');
  const paymentId = url.searchParams.get('paymentId');
  const orderId = url.searchParams.get('orderId');
  const redirectTo = url.searchParams.get('redirect') ?? url.searchParams.get('returnTo');
  const failureSignal = url.searchParams.get('error') || url.searchParams.get('status') === 'failed';
  const status: BillingPaymentCallbackContext['status'] = failureSignal
    ? 'failure'
    : phase === 'finished'
      ? 'finished'
      : phase === 'failure'
        ? 'failure'
        : 'success';

  return {
    request,
    url,
    searchParams: url.searchParams,
    params,
    paymentOwner,
    paymentName,
    paymentId,
    orderId,
    redirectTo,
    status,
    body: await readRequestBody(request),
  };
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
