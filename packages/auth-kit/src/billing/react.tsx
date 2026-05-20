'use client';

import {
  type Context,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  buildBillingActionPayload,
  buildBillingPurchaseRequest,
  deriveBillingCreditsState,
  deriveBillingEntitlements,
  filterBillingPurchasableItems,
  normalizeBillingPurchaseStatus,
  normalizeBillingCatalogConfig,
  normalizeBillingRuntimeConfig,
  resolveBillingItem,
  resolveBillingPurchasable,
  resolveBillingProductSnapshot,
  resolveBillingSubscriptionProduct,
} from './runtime';
import {
  buildCasdoorBuyProductRequest,
  normalizeCasdoorProductId,
} from './casdoor-purchase.js';
import type {
  BillingActionExecutor,
  BillingActionKind,
  BillingActionExecutionResult,
  BillingActionPayload,
  BillingApiClient,
  BillingCatalogConfig,
  BillingCasdoorBuyProductRequest,
  BillingCasdoorBuyProductResponse,
  BillingCasdoorProductDetail,
  BillingCoreContextValue,
  BillingCreditsContextValue,
  BillingCreditsState,
  BillingDefaults,
  BillingEntitlementState,
  BillingLoaders,
  BillingOrderHistoryItem,
  BillingPaymentHistoryItem,
  BillingItem,
  BillingProductState,
  BillingProductContextValue,
  BillingProductSnapshot,
  BillingPurchaseHooks,
  BillingPurchaseStatus,
  BillingRuntimeConfig,
  BillingStatusState,
  BillingSubscriptionContextValue,
  BillingSubscriptionHistoryItem,
  BillingSubscriptionState,
} from './types';

export interface BillingProviderProps {
  children: ReactNode;
  apiClient: BillingApiClient;
  loaders?: BillingLoaders;
  runtimeConfigLoader?: BillingLoaders['runtimeConfigLoader'];
  actionExecutor?: BillingActionExecutor;
  defaults?: BillingDefaults;
  runtimeConfig?: BillingRuntimeConfig | BillingCatalogConfig;
  subscription?: BillingSubscriptionState;
  subscriptionHistory?: BillingSubscriptionHistoryItem[];
  products?: BillingProductState[];
  orderHistory?: BillingOrderHistoryItem[];
  paymentHistory?: BillingPaymentHistoryItem[];
  credits?: BillingCreditsState;
  entitlements?: BillingEntitlementState;
  status?: BillingStatusState;
  purchaseStatus?: BillingPurchaseStatus;
  purchaseHooks?: BillingPurchaseHooks;
  autoRefresh?: boolean;
}

export type BillingCoreProviderProps = BillingProviderProps;
export interface BillingSubscriptionProviderProps {
  children: ReactNode;
  availablePlans?: BillingItem[];
  subscription?: BillingSubscriptionState;
  subscriptionHistory?: BillingSubscriptionHistoryItem[];
  entitlements?: BillingEntitlementState;
  status?: BillingStatusState;
}

export interface BillingProductProviderProps {
  children: ReactNode;
  availableProducts?: BillingItem[];
  products?: BillingProductState[];
  orderHistory?: BillingOrderHistoryItem[];
  paymentHistory?: BillingPaymentHistoryItem[];
  status?: BillingStatusState;
}

export interface BillingCreditsProviderProps {
  children: ReactNode;
  credits?: BillingCreditsState;
  status?: BillingStatusState;
}

export interface BillingPipelineOptions {
  onBeforeAction?: (payload: BillingActionPayload) => Promise<BillingActionPayload>;
  onAfterAction?: (result: { redirectTo?: string; nextAction?: string }) => Promise<void>;
  onError?: (error: unknown) => Promise<void>;
}

const BillingCoreContext = createContext<BillingCoreContextValue | null>(null);
const BillingSubscriptionContext = createContext<BillingSubscriptionContextValue | null>(null);
const BillingProductContext = createContext<BillingProductContextValue | null>(null);
const BillingCreditsContext = createContext<BillingCreditsContextValue | null>(null);

function useOptionalContext<T>(context: Context<T | null>): T | null {
  return useContext(context);
}

function useRequiredCoreContext(): BillingCoreContextValue {
  const context = useContext(BillingCoreContext);
  if (!context) {
    throw new Error('Billing hooks must be used inside BillingProvider or BillingCoreProvider.');
  }
  return context;
}

function choose<T>(primary: T | undefined, fallback: T | undefined): T | undefined {
  return primary ?? fallback;
}

async function runPurchaseHook<T>(
  name: string,
  hook: ((context: T) => void | Promise<void>) | undefined,
  context: T | undefined,
): Promise<void> {
  if (!hook || context === undefined) {
    return;
  }

  try {
    await hook(context);
  } catch (error) {
    console.error(`[casdoor-next-auth-kit] billing ${name} hook failed`, error);
  }
}

function getLatestOrder(orders: BillingOrderHistoryItem[] | undefined): BillingOrderHistoryItem | undefined {
  return [...(orders ?? [])].sort((a, b) => {
    const left = Date.parse(b.updatedAt ?? b.createdAt ?? '') || 0;
    const right = Date.parse(a.updatedAt ?? a.createdAt ?? '') || 0;
    return left - right;
  })[0];
}

function getLatestPayment(payments: BillingPaymentHistoryItem[] | undefined): BillingPaymentHistoryItem | undefined {
  return [...(payments ?? [])].sort((a, b) => {
    const left = Date.parse(b.updatedAt ?? b.createdAt ?? '') || 0;
    const right = Date.parse(a.updatedAt ?? a.createdAt ?? '') || 0;
    return left - right;
  })[0];
}

function extractCasdoorResponseData<TData>(response: { data?: TData } | TData | undefined): TData | undefined {
  if (!response) return undefined;
  if (typeof response === 'object' && response !== null && 'data' in response) {
    return (response as { data?: TData }).data;
  }
  return response as TData;
}

function readBuyProductRedirectTo(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  for (const key of ['redirectTo', 'redirectUrl', 'redirect_url', 'url', 'href', 'location']) {
    const candidate = record[key];
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }

  return undefined;
}

function normalizeBuyProductExecutionResult(response: BillingCasdoorBuyProductResponse, fallbackRedirectTo?: string) {
  const statusText = typeof response.status === 'string' ? response.status.toLowerCase() : '';
  const status = statusText.includes('fail') || statusText.includes('error') || statusText.includes('cancel')
    ? 'failed'
    : statusText.includes('pend') || statusText.includes('require')
      ? 'pending'
      : 'succeeded';

  return {
    status,
    redirectTo:
      readBuyProductRedirectTo(response.data) ??
      readBuyProductRedirectTo(response.data2) ??
      readBuyProductRedirectTo(response.data3) ??
      fallbackRedirectTo,
    rawResult: response,
  } satisfies BillingActionExecutionResult;
}

async function runCasdoorProductPurchase(
  purchaseRequest: NonNullable<ReturnType<typeof buildBillingPurchaseRequest>>,
  apiClient: BillingApiClient,
  loaders: BillingLoaders | undefined,
): Promise<BillingActionExecutionResult | null> {
  const buyProductLoader = loaders?.buyProductLoader ?? apiClient.buyProduct;
  if (!buyProductLoader) {
    return null;
  }

  const productLoader = loaders?.productLoader ?? apiClient.fetchProduct;
  const organizationNamesLoader = loaders?.organizationNamesLoader ?? apiClient.fetchOrganizationNames;

  let productDetail: BillingCasdoorProductDetail | undefined;
  if (productLoader) {
    const productResponse = await productLoader({ id: purchaseRequest.productId }).catch(() => undefined);
    productDetail = extractCasdoorResponseData<BillingCasdoorProductDetail>(productResponse);
  }

  if (!productDetail) {
    if (purchaseRequest.productOwner && purchaseRequest.productName) {
      productDetail = {
        owner: purchaseRequest.productOwner,
        name: purchaseRequest.productName,
      };
    } else {
      try {
        const normalized = normalizeCasdoorProductId(purchaseRequest.productId);
        productDetail = {
          owner: normalized.owner,
          name: normalized.name,
        };
      } catch {
        return null;
      }
    }
  }

  if (organizationNamesLoader && productDetail.owner) {
    const organizationResponse = await organizationNamesLoader({ owner: productDetail.owner }).catch(() => undefined);
    void extractCasdoorResponseData(organizationResponse);
  }

  const buyRequest: BillingCasdoorBuyProductRequest = buildCasdoorBuyProductRequest(
    purchaseRequest,
    productDetail,
    purchaseRequest.providerName,
  );

  const response = await buyProductLoader(buyRequest);
  return normalizeBuyProductExecutionResult(
    response,
    purchaseRequest.returnTo ?? productDetail.returnUrl ?? productDetail.successUrl,
  );
}

function normalizeRuntimeConfigInput(config?: BillingRuntimeConfig | BillingCatalogConfig | null): BillingRuntimeConfig | undefined {
  if (!config) return undefined;
  return normalizeBillingRuntimeConfig(config);
}

function normalizeCatalogConfigInput(config?: BillingRuntimeConfig | BillingCatalogConfig | null): BillingCatalogConfig | undefined {
  if (!config) return undefined;
  return normalizeBillingCatalogConfig(config);
}

function buildCoreValue(input: {
  apiClient: BillingApiClient;
  loaders?: BillingLoaders;
  runtimeConfigLoader?: BillingLoaders['runtimeConfigLoader'];
  actionExecutor?: BillingActionExecutor;
  defaults?: BillingDefaults;
  runtimeConfig?: BillingRuntimeConfig | BillingCatalogConfig;
  runtimeCatalog?: BillingCatalogConfig;
  runtimeConfigLoading: boolean;
  runtimeConfigError: string | null;
  subscription?: BillingSubscriptionState;
  subscriptionHistory?: BillingSubscriptionHistoryItem[];
  products?: BillingProductState[];
  orderHistory?: BillingOrderHistoryItem[];
  paymentHistory?: BillingPaymentHistoryItem[];
  credits?: BillingCreditsState;
  entitlements?: BillingEntitlementState;
  purchaseStatus?: BillingPurchaseStatus;
  purchaseHooks?: BillingPurchaseHooks;
  status: BillingStatusState;
  refresh: () => Promise<void>;
  runAction: (payload: BillingActionPayload) => Promise<BillingActionExecutionResult>;
  setRuntimeConfig: (config?: BillingRuntimeConfig) => void;
  setSubscription: (value?: BillingSubscriptionState) => void;
  setSubscriptionHistory: (value?: BillingSubscriptionHistoryItem[]) => void;
  setProducts: (value?: BillingProductState[]) => void;
  setOrderHistory: (value?: BillingOrderHistoryItem[]) => void;
  setPaymentHistory: (value?: BillingPaymentHistoryItem[]) => void;
  setCredits: (value?: BillingCreditsState) => void;
  setEntitlements: (value?: BillingEntitlementState) => void;
  setPurchaseStatus: (status?: BillingPurchaseStatus) => void;
  setStatus: (status: BillingStatusState | ((current: BillingStatusState) => BillingStatusState)) => void;
}): BillingCoreContextValue {
  return {
    apiClient: input.apiClient,
    loaders: input.loaders,
    runtimeConfigLoader: input.runtimeConfigLoader,
    actionExecutor: input.actionExecutor,
    defaults: input.defaults,
    runtimeConfig: input.runtimeConfig,
    runtimeCatalog: input.runtimeCatalog,
    runtimeConfigLoading: input.runtimeConfigLoading,
    runtimeConfigError: input.runtimeConfigError,
    subscription: input.subscription,
    subscriptionHistory: input.subscriptionHistory,
    products: input.products,
    orderHistory: input.orderHistory,
    paymentHistory: input.paymentHistory,
    availablePlans: filterBillingPurchasableItems(
      input.runtimeConfig?.items?.filter((item) => item.kind === 'subscription'),
      input.runtimeConfig ?? input.runtimeCatalog,
    ),
    availableProducts: filterBillingPurchasableItems(
      input.runtimeConfig?.items?.filter((item) => item.kind === 'product'),
      input.runtimeConfig ?? input.runtimeCatalog,
    ),
    credits: input.credits,
    entitlements: input.entitlements,
    purchaseStatus: input.purchaseStatus,
    purchaseHooks: input.purchaseHooks,
    status: input.status,
    refresh: input.refresh,
    runAction: input.runAction,
    setRuntimeConfig: input.setRuntimeConfig,
    setSubscription: input.setSubscription,
    setSubscriptionHistory: input.setSubscriptionHistory,
    setProducts: input.setProducts,
    setOrderHistory: input.setOrderHistory,
    setPaymentHistory: input.setPaymentHistory,
    setCredits: input.setCredits,
    setEntitlements: input.setEntitlements,
    setPurchaseStatus: input.setPurchaseStatus,
    setStatus: input.setStatus,
  };
}

export function BillingProvider({
  children,
  apiClient,
  loaders,
  runtimeConfigLoader,
  actionExecutor,
  defaults,
  runtimeConfig: runtimeConfigProp,
  subscription: subscriptionProp,
  subscriptionHistory: subscriptionHistoryProp,
  products: productsProp,
  orderHistory: orderHistoryProp,
  paymentHistory: paymentHistoryProp,
  credits: creditsProp,
  entitlements: entitlementsProp,
  status: statusProp,
  purchaseStatus: purchaseStatusProp,
  purchaseHooks,
  autoRefresh = true,
}: BillingProviderProps) {
  const [runtimeConfig, setRuntimeConfig] = useState<BillingRuntimeConfig | undefined>(normalizeRuntimeConfigInput(runtimeConfigProp));
  const [runtimeCatalog, setRuntimeCatalog] = useState<BillingCatalogConfig | undefined>(normalizeCatalogConfigInput(runtimeConfigProp));
  const [runtimeConfigLoading, setRuntimeConfigLoading] = useState(false);
  const [runtimeConfigError, setRuntimeConfigError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<BillingSubscriptionState | undefined>(subscriptionProp);
  const [subscriptionHistory, setSubscriptionHistory] = useState<BillingSubscriptionHistoryItem[] | undefined>(subscriptionHistoryProp);
  const [products, setProducts] = useState<BillingProductState[] | undefined>(productsProp);
  const [orderHistory, setOrderHistory] = useState<BillingOrderHistoryItem[] | undefined>(orderHistoryProp);
  const [paymentHistory, setPaymentHistory] = useState<BillingPaymentHistoryItem[] | undefined>(paymentHistoryProp);
  const [credits, setCredits] = useState<BillingCreditsState | undefined>(creditsProp);
  const [entitlements, setEntitlements] = useState<BillingEntitlementState | undefined>(entitlementsProp);
  const [purchaseStatus, setPurchaseStatus] = useState<BillingPurchaseStatus | undefined>(purchaseStatusProp);
  const [status, setStatus] = useState<BillingStatusState>(
    statusProp ?? { loading: false, refreshing: false, error: null },
  );

  useEffect(() => {
    if (runtimeConfigProp) {
      setRuntimeConfig(normalizeRuntimeConfigInput(runtimeConfigProp));
      setRuntimeCatalog(normalizeCatalogConfigInput(runtimeConfigProp));
    }
  }, [runtimeConfigProp]);

  useEffect(() => {
    if (subscriptionProp) setSubscription(subscriptionProp);
  }, [subscriptionProp]);

  useEffect(() => {
    if (subscriptionHistoryProp) setSubscriptionHistory(subscriptionHistoryProp);
  }, [subscriptionHistoryProp]);

  useEffect(() => {
    if (productsProp) setProducts(productsProp);
  }, [productsProp]);

  useEffect(() => {
    if (orderHistoryProp) setOrderHistory(orderHistoryProp);
  }, [orderHistoryProp]);

  useEffect(() => {
    if (paymentHistoryProp) setPaymentHistory(paymentHistoryProp);
  }, [paymentHistoryProp]);

  useEffect(() => {
    if (creditsProp) setCredits(creditsProp);
  }, [creditsProp]);

  useEffect(() => {
    if (entitlementsProp) setEntitlements(entitlementsProp);
  }, [entitlementsProp]);

  useEffect(() => {
    if (purchaseStatusProp) setPurchaseStatus(purchaseStatusProp);
  }, [purchaseStatusProp]);

  useEffect(() => {
    if (statusProp) setStatus(statusProp);
  }, [statusProp]);

  const refresh = useCallback(async () => {
    const catalogKey = runtimeCatalog?.catalogKey ?? runtimeConfig?.catalogKey ?? 'default';
    const runtimeLoader = runtimeConfigLoader ?? apiClient.fetchRuntimeConfig;
    const resolvedLoaders = loaders ?? {};
    const subscriptionLoader = resolvedLoaders.subscriptionLoader ?? apiClient.fetchSubscription;
    const subscriptionHistoryLoader = resolvedLoaders.subscriptionHistoryLoader ?? apiClient.fetchSubscriptionHistory;
    const productsLoader = resolvedLoaders.productsLoader ?? apiClient.fetchProducts;
    const orderHistoryLoader = resolvedLoaders.orderHistoryLoader ?? apiClient.fetchOrderHistory;
    const paymentHistoryLoader = resolvedLoaders.paymentHistoryLoader ?? apiClient.fetchPaymentHistory;
    const purchaseStatusLoader = resolvedLoaders.purchaseStatusLoader ?? apiClient.fetchPurchaseStatus;
    const creditsLoader = resolvedLoaders.creditsLoader ?? apiClient.fetchCredits;
    const entitlementsLoader = resolvedLoaders.entitlementsLoader ?? apiClient.fetchEntitlements;

    setRuntimeConfigLoading(true);
    setRuntimeConfigError(null);
    setStatus((current) => ({ ...current, loading: true, refreshing: true, error: null }));

    try {
      const nextRuntimeCatalog = normalizeCatalogConfigInput(await runtimeLoader(catalogKey));
      const nextRuntimeConfig = nextRuntimeCatalog ? normalizeRuntimeConfigInput(nextRuntimeCatalog) : undefined;
      if (nextRuntimeConfig) {
        setRuntimeCatalog(nextRuntimeCatalog);
        setRuntimeConfig(nextRuntimeConfig);
      }

      const nextCatalogKey = nextRuntimeConfig?.catalogKey ?? nextRuntimeCatalog?.catalogKey ?? catalogKey;

      const [
        nextSubscription,
        nextSubscriptionHistory,
        nextProducts,
        nextOrderHistory,
        nextPaymentHistory,
        nextCredits,
        nextEntitlements,
      ] = await Promise.all([
        subscriptionLoader({ catalogKey: nextCatalogKey }),
        subscriptionHistoryLoader({ catalogKey: nextCatalogKey }),
        productsLoader({ catalogKey: nextCatalogKey }),
        orderHistoryLoader({ catalogKey: nextCatalogKey }),
        paymentHistoryLoader({ catalogKey: nextCatalogKey }),
        creditsLoader({ catalogKey: nextCatalogKey }),
        entitlementsLoader({ catalogKey: nextCatalogKey }),
      ]);

      const subscriptionWithProduct = nextSubscription
        ? {
            ...nextSubscription,
            product: resolveBillingSubscriptionProduct(nextSubscription, nextRuntimeConfig ?? runtimeConfig),
          }
        : undefined;
      const normalizedCredits = deriveBillingCreditsState(nextCredits, nextProducts, nextRuntimeConfig?.conversionRules ?? runtimeConfig?.conversionRules);
      const normalizedEntitlements = nextEntitlements ?? deriveBillingEntitlements(subscriptionWithProduct, nextProducts, normalizedCredits, nextRuntimeConfig ?? runtimeConfig);
      const latestOrder = getLatestOrder(nextOrderHistory);
      const latestPayment = getLatestPayment(nextPaymentHistory);
      const fetchedPurchaseStatus = await purchaseStatusLoader({
        orderId: latestOrder?.orderId,
        paymentId: latestPayment?.paymentId,
        transactionId: latestPayment?.transactionId ?? latestOrder?.transactionId,
      }).catch(() => undefined);
      const normalizedPurchaseStatus = normalizeBillingPurchaseStatus(
        fetchedPurchaseStatus,
        latestOrder,
        latestPayment,
      );

      setSubscription(subscriptionWithProduct);
      setSubscriptionHistory(nextSubscriptionHistory);
      setProducts(nextProducts);
      setOrderHistory(nextOrderHistory);
      setPaymentHistory(nextPaymentHistory);
      setCredits(normalizedCredits);
      setEntitlements(normalizedEntitlements);
      setPurchaseStatus(normalizedPurchaseStatus);
      setStatus({ loading: false, refreshing: false, error: null, lastFetchedAt: new Date().toISOString() });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setRuntimeConfigError(message);
      setStatus((current) => ({ ...current, loading: false, refreshing: false, error: message }));
    } finally {
      setRuntimeConfigLoading(false);
    }
  }, [apiClient, loaders, runtimeConfig, runtimeConfigLoader, runtimeCatalog]);

  const runAction = useCallback(
    async (payload: BillingActionPayload) => {
      const prepared = buildBillingActionPayload(payload, runtimeConfig);
      const executor = actionExecutor ?? ((input: BillingActionPayload) => apiClient.createAction(input));
      const isPurchaseFlow = prepared.kind === 'purchase' || prepared.kind === 'subscribe';
      const purchasable = isPurchaseFlow
        ? resolveBillingPurchasable(runtimeConfig, prepared.key) ?? resolveBillingPurchasable(runtimeConfig, prepared.productId)
        : undefined;
      const purchaseRequest = isPurchaseFlow ? buildBillingPurchaseRequest(prepared, runtimeConfig) : null;

      if (isPurchaseFlow && !purchasable) {
        throw new Error(`Billing item "${prepared.key}" is not purchasable in the current runtime config.`);
      }

      await runPurchaseHook('onPurchaseStart', purchaseHooks?.onPurchaseStart, purchaseRequest ?? undefined);

      setPurchaseStatus((current) => ({
        actionKey: prepared.key,
        orderId: current?.orderId,
        paymentId: current?.paymentId,
        transactionId: current?.transactionId,
        status: 'pending',
        redirectTo: current?.redirectTo,
        updatedAt: new Date().toISOString(),
      }));
      setStatus((current) => ({ ...current, loading: true, refreshing: true, error: null }));

      try {
        let result: BillingActionExecutionResult;
        let usedCasdoorPurchaseFlow = false;
        if (isPurchaseFlow && purchaseRequest) {
          const casdoorResult = await runCasdoorProductPurchase(
            purchaseRequest as NonNullable<ReturnType<typeof buildBillingPurchaseRequest>>,
            apiClient,
            loaders,
          );
          if (casdoorResult) {
            result = casdoorResult;
            usedCasdoorPurchaseFlow = true;
          } else {
            result = await executor(prepared);
          }
        } else {
          result = await executor(prepared);
        }
        await runPurchaseHook(
          'onOrderCreated',
          purchaseHooks?.onOrderCreated,
          purchaseRequest && purchasable
            ? {
                request: purchaseRequest,
                purchasable,
                orderId: result.orderId ?? null,
                paymentId: result.paymentId ?? null,
                redirectTo: result.redirectTo ?? null,
                rawResult: result.rawResult ?? result,
              }
            : undefined,
        );

        setPurchaseStatus((current) => ({
          actionKey: prepared.key,
          orderId: current?.orderId,
          paymentId: current?.paymentId,
          transactionId: current?.transactionId,
          status:
            usedCasdoorPurchaseFlow && result.status !== 'failed'
              ? 'requires_payment'
              : result.status === 'failed'
                ? 'failed'
                : result.status === 'succeeded'
                  ? 'paid'
                  : 'pending',
          redirectTo: result.redirectTo ?? current?.redirectTo,
          updatedAt: new Date().toISOString(),
        }));
        if (result.redirectTo || result.nextAction) {
          // host handles the redirect/next action, we only persist the result
        }

        await runPurchaseHook(
          'onPurchaseComplete',
          purchaseHooks?.onPurchaseComplete,
          purchaseRequest
            ? {
                request: purchaseRequest,
                orderId: result.orderId ?? null,
                paymentId: result.paymentId ?? null,
                status: result.status === 'failed' ? 'failed' : 'succeeded',
                redirectTo: result.redirectTo ?? null,
              }
            : undefined,
        );

        await refresh();
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await runPurchaseHook(
          'onPurchaseComplete',
          purchaseHooks?.onPurchaseComplete,
          purchaseRequest
            ? {
                request: purchaseRequest,
                orderId: null,
                paymentId: null,
                status: 'failed',
                redirectTo: null,
              }
            : undefined,
        );
        setPurchaseStatus((current) => ({
          actionKey: prepared.key,
          orderId: current?.orderId,
          paymentId: current?.paymentId,
          transactionId: current?.transactionId,
          status: 'failed',
          redirectTo: current?.redirectTo,
          updatedAt: new Date().toISOString(),
        }));
        setStatus((current) => ({ ...current, loading: false, refreshing: false, error: message }));
        throw error;
      }
    },
    [actionExecutor, apiClient, loaders, purchaseHooks, refresh, runtimeConfig],
  );

  useEffect(() => {
    if (!autoRefresh) return;
    if (runtimeConfigLoading) return;
    if (!runtimeConfig && !runtimeConfigError) {
      void refresh();
    }
  }, [autoRefresh, refresh, runtimeConfig, runtimeConfigError, runtimeConfigLoading]);

  const coreValue = useMemo(
    () =>
      buildCoreValue({
        apiClient,
        loaders,
        runtimeConfigLoader,
        actionExecutor,
        defaults,
        runtimeConfig,
        runtimeCatalog,
        runtimeConfigLoading,
        runtimeConfigError,
        subscription,
        subscriptionHistory,
        products,
        orderHistory,
        paymentHistory,
        credits,
        entitlements,
        purchaseStatus,
        purchaseHooks,
        status,
        refresh,
        runAction,
        setRuntimeConfig,
        setSubscription,
        setSubscriptionHistory,
        setProducts,
        setOrderHistory,
        setPaymentHistory,
        setCredits,
        setEntitlements,
        setPurchaseStatus,
        setStatus,
      }),
    [
      actionExecutor,
      apiClient,
      credits,
      defaults,
      entitlements,
      orderHistory,
      paymentHistory,
      products,
      purchaseStatus,
      purchaseHooks,
      refresh,
      runAction,
      runtimeConfig,
      runtimeConfigError,
      runtimeConfigLoader,
      runtimeConfigLoading,
      runtimeCatalog,
      loaders,
      status,
      subscription,
      subscriptionHistory,
    ],
  );

  return (
    <BillingCoreContext.Provider value={coreValue}>
      <SubscriptionProvider subscription={subscription} subscriptionHistory={subscriptionHistory} entitlements={entitlements} status={status}>
        <ProductProvider products={products} orderHistory={orderHistory} paymentHistory={paymentHistory} status={status}>
          <CreditsProvider credits={credits} status={status}>{children}</CreditsProvider>
        </ProductProvider>
      </SubscriptionProvider>
    </BillingCoreContext.Provider>
  );
}

export function BillingCoreProvider(props: BillingCoreProviderProps) {
  return <BillingProvider {...props} />;
}

export function SubscriptionProvider({
  children,
  availablePlans,
  subscription,
  subscriptionHistory,
  entitlements,
  status,
}: BillingSubscriptionProviderProps) {
  const core = useOptionalContext(BillingCoreContext);
  const runtimeConfig = core?.runtimeConfig ?? core?.runtimeCatalog;
  const visiblePlans = choose(availablePlans, core?.availablePlans);
  const value = useMemo<BillingSubscriptionContextValue>(
    () => ({
      availablePlans: choose(
        visiblePlans ? filterBillingPurchasableItems(visiblePlans, runtimeConfig) : undefined,
        filterBillingPurchasableItems(core?.runtimeConfig?.items?.filter((item) => item.kind === 'subscription'), runtimeConfig),
      ),
      subscription: choose(subscription, core?.subscription),
      subscriptionHistory: choose(subscriptionHistory, core?.subscriptionHistory),
      entitlements: choose(entitlements, core?.entitlements),
      status: choose(status, core?.status),
    }),
    [availablePlans, core?.availablePlans, core?.entitlements, core?.runtimeCatalog, core?.runtimeConfig, core?.status, core?.subscription, core?.subscriptionHistory, entitlements, runtimeConfig, status, subscription, subscriptionHistory, visiblePlans],
  );

  return <BillingSubscriptionContext.Provider value={value}>{children}</BillingSubscriptionContext.Provider>;
}

export function ProductProvider({
  children,
  availableProducts,
  products,
  orderHistory,
  paymentHistory,
  status,
}: BillingProductProviderProps) {
  const core = useOptionalContext(BillingCoreContext);
  const runtimeConfig = core?.runtimeConfig ?? core?.runtimeCatalog;
  const visibleProducts = choose(availableProducts, core?.availableProducts);
  const value = useMemo<BillingProductContextValue>(
    () => ({
      availableProducts: choose(
        visibleProducts ? filterBillingPurchasableItems(visibleProducts, runtimeConfig) : undefined,
        filterBillingPurchasableItems(core?.runtimeConfig?.items?.filter((item) => item.kind === 'product'), runtimeConfig),
      ),
      products: choose(products, core?.products),
      orderHistory: choose(orderHistory, core?.orderHistory),
      paymentHistory: choose(paymentHistory, core?.paymentHistory),
      status: choose(status, core?.status),
    }),
    [availableProducts, core?.availableProducts, core?.orderHistory, core?.paymentHistory, core?.products, core?.runtimeCatalog, core?.runtimeConfig, core?.status, orderHistory, paymentHistory, products, runtimeConfig, status, visibleProducts],
  );

  return <BillingProductContext.Provider value={value}>{children}</BillingProductContext.Provider>;
}

export function CreditsProvider({ children, credits, status }: BillingCreditsProviderProps) {
  const core = useOptionalContext(BillingCoreContext);
  const value = useMemo<BillingCreditsContextValue>(
    () => ({
      credits: choose(credits, core?.credits),
      status: choose(status, core?.status),
    }),
    [credits, core?.credits, core?.status, status],
  );

  return <BillingCreditsContext.Provider value={value}>{children}</BillingCreditsContext.Provider>;
}

export interface BillingCatalogState {
  catalog?: BillingRuntimeConfig | BillingCatalogConfig;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBillingContext(): BillingCoreContextValue {
  return useRequiredCoreContext();
}

export function useBillingCatalog(): BillingCatalogState {
  const core = useRequiredCoreContext();
  return useMemo(
    () => ({
      catalog: core.runtimeCatalog ?? core.runtimeConfig,
      loading: core.runtimeConfigLoading,
      error: core.runtimeConfigError,
      refresh: core.refresh,
    }),
    [core.refresh, core.runtimeCatalog, core.runtimeConfig, core.runtimeConfigError, core.runtimeConfigLoading],
  );
}

export interface BillingItemState {
  item?: BillingProductSnapshot;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBillingItem(itemKey: string): BillingItemState {
  const core = useRequiredCoreContext();
  return useMemo(() => {
    const item = resolveBillingItem(core.runtimeConfig?.items, itemKey);
    return {
      item: resolveBillingProductSnapshot(item),
      loading: core.runtimeConfigLoading,
      error: core.runtimeConfigError,
      refresh: core.refresh,
    };
  }, [core.refresh, core.runtimeConfig?.items, core.runtimeConfigError, core.runtimeConfigLoading, itemKey]);
}

export interface BillingProductDetailState {
  product?: BillingCasdoorProductDetail;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBillingProductDetail(productId: string): BillingProductDetailState {
  const core = useRequiredCoreContext();
  const productLoader = core.loaders?.productLoader ?? core.apiClient.fetchProduct;
  const [product, setProduct] = useState<BillingCasdoorProductDetail | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!productLoader || !productId) {
      setProduct(undefined);
      setError(productId ? 'Missing Casdoor product loader.' : null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await productLoader({ id: productId });
      const detail = extractCasdoorResponseData<BillingCasdoorProductDetail>(response);
      setProduct(detail);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setProduct(undefined);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [productId, productLoader]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      product,
      loading: loading || core.runtimeConfigLoading || core.status.loading,
      error: error ?? core.runtimeConfigError ?? core.status.error,
      refresh,
    }),
    [core.runtimeConfigError, core.runtimeConfigLoading, core.status.error, core.status.loading, error, loading, product, refresh],
  );
}

export interface BillingProductPurchaseOptionsState {
  product?: BillingCasdoorProductDetail;
  providers: BillingCasdoorProductDetail['providers'];
  providerObjs: BillingCasdoorProductDetail['providerObjs'];
  providerName?: string;
  selectedProvider?: NonNullable<BillingCasdoorProductDetail['providerObjs']>[number];
  setProviderName: (providerName?: string) => void;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBillingProductPurchaseOptions(productId: string, preferredProviderName?: string): BillingProductPurchaseOptionsState {
  const detailState = useBillingProductDetail(productId);
  const [providerName, setProviderName] = useState<string | undefined>(preferredProviderName);

  useEffect(() => {
    if (preferredProviderName) {
      setProviderName(preferredProviderName);
      return;
    }

    const product = detailState.product;
    const fallbackProvider = product?.providers?.[0] ?? product?.providerObjs?.[0]?.name;
    if (!providerName || (product && !product.providers?.includes(providerName) && !product.providerObjs?.some((item) => item.name === providerName))) {
      setProviderName(fallbackProvider);
    }
  }, [detailState.product, preferredProviderName, providerName]);

  return useMemo(
    () => ({
      product: detailState.product,
      providers: detailState.product?.providers ?? [],
      providerObjs: detailState.product?.providerObjs ?? [],
      providerName,
      selectedProvider: detailState.product?.providerObjs?.find((item) => item.name === providerName),
      setProviderName,
      loading: detailState.loading,
      error: detailState.error,
      refresh: detailState.refresh,
    }),
    [detailState.error, detailState.loading, detailState.product, detailState.refresh, providerName],
  );
}

export interface BillingProductsState {
  products: BillingProductState[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBillingProducts(): BillingProductsState {
  const core = useRequiredCoreContext();
  const productContext = useOptionalContext(BillingProductContext);
  const products = choose(productContext?.products, core.products) ?? [];
  return useMemo(
    () => ({
      products,
      loading: core.runtimeConfigLoading || core.status.loading,
      error: core.runtimeConfigError ?? core.status.error,
      refresh: core.refresh,
    }),
    [core.refresh, core.runtimeConfigError, core.runtimeConfigLoading, core.status.error, core.status.loading, products],
  );
}

export interface BillingAvailablePlansState {
  plans: BillingItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBillingAvailablePlans(): BillingAvailablePlansState {
  const core = useRequiredCoreContext();
  const subscriptionContext = useOptionalContext(BillingSubscriptionContext);
  const plans = choose(subscriptionContext?.availablePlans, core.availablePlans) ?? [];
  return useMemo(
    () => ({
      plans,
      loading: core.runtimeConfigLoading || core.status.loading,
      error: core.runtimeConfigError ?? core.status.error,
      refresh: core.refresh,
    }),
    [core.availablePlans, core.refresh, core.runtimeConfigError, core.runtimeConfigLoading, core.status.error, core.status.loading, plans],
  );
}

export interface BillingAvailableProductsState {
  items: BillingItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBillingAvailableProducts(): BillingAvailableProductsState {
  const core = useRequiredCoreContext();
  const productContext = useOptionalContext(BillingProductContext);
  const items = choose(productContext?.availableProducts, core.availableProducts) ?? [];
  return useMemo(
    () => ({
      items,
      loading: core.runtimeConfigLoading || core.status.loading,
      error: core.runtimeConfigError ?? core.status.error,
      refresh: core.refresh,
    }),
    [core.availableProducts, core.refresh, core.runtimeConfigError, core.runtimeConfigLoading, core.status.error, core.status.loading, items],
  );
}

export interface BillingOrderHistoryState {
  orders: BillingOrderHistoryItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBillingOrderHistory(_options: { userId?: string; catalogKey?: string; productKey?: string } = {}): BillingOrderHistoryState {
  const core = useRequiredCoreContext();
  const productContext = useOptionalContext(BillingProductContext);
  const orders = choose(productContext?.orderHistory, core.orderHistory) ?? [];
  return useMemo(
    () => ({
      orders,
      loading: core.runtimeConfigLoading || core.status.loading,
      error: core.runtimeConfigError ?? core.status.error,
      refresh: core.refresh,
    }),
    [core.refresh, core.runtimeConfigError, core.runtimeConfigLoading, core.status.error, core.status.loading, orders],
  );
}

export interface BillingPaymentHistoryState {
  payments: BillingPaymentHistoryItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBillingPaymentHistory(_options: { userId?: string; catalogKey?: string } = {}): BillingPaymentHistoryState {
  const core = useRequiredCoreContext();
  const productContext = useOptionalContext(BillingProductContext);
  const payments = choose(productContext?.paymentHistory, core.paymentHistory) ?? [];
  return useMemo(
    () => ({
      payments,
      loading: core.runtimeConfigLoading || core.status.loading,
      error: core.runtimeConfigError ?? core.status.error,
      refresh: core.refresh,
    }),
    [core.refresh, core.runtimeConfigError, core.runtimeConfigLoading, core.status.error, core.status.loading, payments],
  );
}

export interface BillingSubscriptionStateView {
  subscription?: BillingSubscriptionState;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBillingSubscription(): BillingSubscriptionStateView {
  const core = useRequiredCoreContext();
  const subscriptionContext = useOptionalContext(BillingSubscriptionContext);
  return useMemo(
    () => ({
      subscription: choose(subscriptionContext?.subscription, core.subscription),
      loading: core.runtimeConfigLoading || core.status.loading,
      error: core.runtimeConfigError ?? core.status.error,
      refresh: core.refresh,
    }),
    [core.refresh, core.runtimeConfigError, core.runtimeConfigLoading, core.status.error, core.status.loading, core.subscription, subscriptionContext?.subscription],
  );
}

export interface BillingSubscriptionProductState {
  product?: BillingProductSnapshot;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBillingSubscriptionProduct(): BillingSubscriptionProductState {
  const core = useRequiredCoreContext();
  const subscriptionContext = useOptionalContext(BillingSubscriptionContext);
  const subscription = choose(subscriptionContext?.subscription, core.subscription);
  return useMemo(
    () => ({
      product: subscription?.product ?? resolveBillingSubscriptionProduct(subscription, core.runtimeConfig),
      loading: core.runtimeConfigLoading || core.status.loading,
      error: core.runtimeConfigError ?? core.status.error,
      refresh: core.refresh,
    }),
    [core.refresh, core.runtimeConfig, core.runtimeConfigError, core.runtimeConfigLoading, core.status.error, core.status.loading, subscription],
  );
}

export interface BillingSubscriptionHistoryState {
  history: BillingSubscriptionHistoryItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBillingSubscriptionHistory(_options: { userId?: string; catalogKey?: string } = {}): BillingSubscriptionHistoryState {
  const core = useRequiredCoreContext();
  const subscriptionContext = useOptionalContext(BillingSubscriptionContext);
  const history = choose(subscriptionContext?.subscriptionHistory, core.subscriptionHistory) ?? [];
  return useMemo(
    () => ({
      history,
      loading: core.runtimeConfigLoading || core.status.loading,
      error: core.runtimeConfigError ?? core.status.error,
      refresh: core.refresh,
    }),
    [core.refresh, core.runtimeConfigError, core.runtimeConfigLoading, core.status.error, core.status.loading, history],
  );
}

export interface BillingCreditsStateView {
  credits?: BillingCreditsState;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBillingCredits(): BillingCreditsStateView {
  const core = useRequiredCoreContext();
  const creditsContext = useOptionalContext(BillingCreditsContext);
  const credits = choose(creditsContext?.credits, core.credits) ?? deriveBillingCreditsState(undefined, core.products, core.runtimeConfig?.conversionRules);
  return useMemo(
    () => ({
      credits,
      loading: core.runtimeConfigLoading || core.status.loading,
      error: core.runtimeConfigError ?? core.status.error,
      refresh: core.refresh,
    }),
    [core.refresh, core.runtimeConfig?.conversionRules, core.runtimeConfigError, core.runtimeConfigLoading, core.products, core.status.error, core.status.loading, credits],
  );
}

export interface BillingEntitlementsStateView {
  entitlements?: BillingEntitlementState;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBillingEntitlements(): BillingEntitlementsStateView {
  const core = useRequiredCoreContext();
  const subscriptionContext = useOptionalContext(BillingSubscriptionContext);
  const entitlements =
    choose(subscriptionContext?.entitlements, core.entitlements) ??
    deriveBillingEntitlements(subscriptionContext?.subscription ?? core.subscription, core.products, core.credits, core.runtimeConfig);
  return useMemo(
    () => ({
      entitlements,
      loading: core.runtimeConfigLoading || core.status.loading,
      error: core.runtimeConfigError ?? core.status.error,
      refresh: core.refresh,
    }),
    [core.credits, core.products, core.refresh, core.runtimeConfig, core.runtimeConfigError, core.runtimeConfigLoading, core.status.error, core.status.loading, entitlements, subscriptionContext?.subscription, core.subscription],
  );
}

export interface BillingPurchaseStatusView {
  purchaseStatus?: BillingPurchaseStatus;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBillingPurchaseStatus(): BillingPurchaseStatusView {
  const core = useRequiredCoreContext();
  const productContext = useOptionalContext(BillingProductContext);
  const order = getLatestOrder(choose(productContext?.orderHistory, core.orderHistory));
  const payment = getLatestPayment(choose(productContext?.paymentHistory, core.paymentHistory));
  const purchaseStatus = core.purchaseStatus ?? normalizeBillingPurchaseStatus(undefined, order, payment);
  return useMemo(
    () => ({
      purchaseStatus,
      loading: core.runtimeConfigLoading || core.status.loading,
      error: core.runtimeConfigError ?? core.status.error,
      refresh: core.refresh,
    }),
    [core.purchaseStatus, core.refresh, core.runtimeConfigError, core.runtimeConfigLoading, core.status.error, core.status.loading, order, payment, purchaseStatus],
  );
}

export interface BillingStatusView {
  status: BillingStatusState;
}

export function useBillingStatus(): BillingStatusView {
  const core = useRequiredCoreContext();
  return useMemo(() => ({ status: core.status }), [core.status]);
}

export interface BillingRefreshView {
  refresh: () => Promise<void>;
}

export function useBillingRefresh(): BillingRefreshView {
  const core = useRequiredCoreContext();
  return useMemo(() => ({ refresh: core.refresh }), [core.refresh]);
}

export interface BillingPipelineResult {
  run: (payload: BillingActionPayload) => Promise<void>;
  loading: boolean;
  error: string | null;
  purchaseStatus?: BillingPurchaseStatus;
  refresh: () => Promise<void>;
}

export function useBillingPipeline(options: BillingPipelineOptions = {}): BillingPipelineResult {
  const core = useRequiredCoreContext();
  const purchaseStatusView = useBillingPurchaseStatus();

  const run = useCallback(
    async (payload: BillingActionPayload) => {
      const prepared = options.onBeforeAction ? await options.onBeforeAction(payload) : payload;
      try {
        const result = await core.runAction(prepared);
        if (options.onAfterAction) {
          await options.onAfterAction({ redirectTo: result.redirectTo, nextAction: result.nextAction });
        }
      } catch (error) {
        if (options.onError) {
          await options.onError(error);
        }
        throw error;
      }
    },
    [core, options],
  );

  return useMemo(
    () => ({
      run,
      loading: core.status.loading || core.runtimeConfigLoading,
      error: core.status.error ?? core.runtimeConfigError,
      purchaseStatus: purchaseStatusView.purchaseStatus,
      refresh: core.refresh,
    }),
    [core.refresh, core.runtimeConfigError, core.runtimeConfigLoading, core.status.error, core.status.loading, purchaseStatusView.purchaseStatus, run],
  );
}

export interface BillingActionHookResult {
  run: (payload: BillingActionPayload) => Promise<void>;
  loading: boolean;
  error: string | null;
}

function useBillingActionRunner(kind: BillingActionKind, defaults?: Partial<BillingActionPayload>): BillingActionHookResult {
  const pipeline = useBillingPipeline();
  const run = useCallback(
    async (payload: BillingActionPayload) => {
      await pipeline.run({
        ...defaults,
        ...payload,
        kind,
      });
    },
    [defaults, kind, pipeline],
  );

  return useMemo(
    () => ({
      run,
      loading: pipeline.loading,
      error: pipeline.error,
    }),
    [pipeline.error, pipeline.loading, run],
  );
}

export function useSubscribePlan(): BillingActionHookResult {
  return useBillingActionRunner('subscribe');
}

export function useManageSubscription(): BillingActionHookResult {
  return useBillingActionRunner('manage');
}

export function useUpgradePlan(): BillingActionHookResult {
  return useBillingActionRunner('upgrade');
}

export function useCancelSubscription(): BillingActionHookResult {
  return useBillingActionRunner('cancel');
}

export function usePurchaseProduct(): BillingActionHookResult {
  return useBillingActionRunner('purchase');
}

export interface BillingProductStateView {
  product?: BillingProductState;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBillingProduct(productKey: string): BillingProductStateView {
  const productsState = useBillingProducts();
  const product = productsState.products.find((item) => item.productKey === productKey);
  return useMemo(
    () => ({
      product,
      loading: productsState.loading,
      error: productsState.error,
      refresh: productsState.refresh,
    }),
    [product, productsState.error, productsState.loading, productsState.refresh],
  );
}

export function useBillingCatalogConfig(): BillingCatalogState {
  return useBillingCatalog();
}
