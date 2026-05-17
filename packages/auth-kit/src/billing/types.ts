export type BillingItemKind = 'subscription' | 'product';
export type BillingInterval = 'month' | 'year';

export interface BillingConversionRule {
  productKey: string;
  kind: 'grant-credits' | 'redeem-credits';
  creditsPerUnit: number;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface BillingDefaults {
  defaultReturnTo?: string;
  defaultQuantity?: number;
  defaultInterval?: BillingInterval;
}

export interface BillingItem {
  key: string;
  kind: BillingItemKind;
  title: string;
  description?: string;
  featured?: boolean;
  badge?: string;
  priceLabel?: string;
  priceValue?: number;
  interval?: BillingInterval;
  credits?: number;
  features?: string[];
  backendRef: {
    productId: string;
    planId?: string;
    priceId?: string;
  };
  creditGrant?: {
    creditsPerUnit: number;
    unitName?: string;
  };
  creditRedeem?: {
    productKey: string;
    creditsPerUnit: number;
  };
  metadata?: Record<string, string>;
}

export interface BillingRuntimeConfig {
  catalogKey: string;
  items: BillingItem[];
  conversionRules?: BillingConversionRule[];
  defaults?: BillingDefaults;
}

export interface BillingCatalogConfig extends BillingRuntimeConfig {
  title?: string;
  description?: string;
  portalPath?: string;
  successPath?: string;
  cancelPath?: string;
}

export interface BillingPaymentSuccessContext {
  request: Request;
  url: URL;
  searchParams: URLSearchParams;
  params: Record<string, string>;
  body: unknown;
  paymentId: string | null;
  orderId: string | null;
  redirectTo: string | null;
}

export type BillingPaymentSuccessHandlerResult =
  | void
  | null
  | string
  | Response
  | {
      redirectTo?: string | null;
    };

export type BillingPaymentSuccessHandler = (
  context: BillingPaymentSuccessContext,
) => BillingPaymentSuccessHandlerResult | Promise<BillingPaymentSuccessHandlerResult>;

export type BillingPaymentFinishedHandler = BillingPaymentSuccessHandler;

export interface BillingPaymentSuccessRouteOptions {
  appUrl?: string;
  fallbackRedirect?: string;
  handler?: BillingPaymentSuccessHandler;
}

export type BillingPaymentFinishedRouteOptions = BillingPaymentSuccessRouteOptions;

export type BillingActionKind = 'purchase' | 'subscribe' | 'manage' | 'upgrade' | 'cancel';

export interface BillingSubscriptionPurchaseConfig {
  productKey: string;
  productId: string;
  planId?: string;
  priceId?: string;
  interval?: BillingInterval;
  quantity?: number;
  metadata?: Record<string, string>;
}

export interface BillingProductPurchaseConfig {
  productKey: string;
  productId: string;
  priceId?: string;
  quantity?: number;
  creditGrant?: BillingItem['creditGrant'];
  creditRedeem?: BillingItem['creditRedeem'];
  metadata?: Record<string, string>;
}

export interface BillingActionPayload {
  key: string;
  kind: BillingActionKind;
  productId?: string;
  planId?: string;
  priceId?: string;
  quantity?: number;
  interval?: BillingInterval;
  subscriptionConfig?: BillingSubscriptionPurchaseConfig;
  productConfig?: BillingProductPurchaseConfig;
  returnTo?: string;
  metadata?: Record<string, string>;
}

export interface BillingProductSnapshot {
  productKey: string;
  productId?: string;
  title?: string;
  kind: BillingItemKind;
  planId?: string;
  priceId?: string;
  interval?: BillingInterval;
  creditGrant?: BillingItem['creditGrant'];
  creditRedeem?: BillingItem['creditRedeem'];
  metadata?: Record<string, string>;
}

export interface BillingSubscriptionState {
  subscriptionId?: string;
  planKey?: string;
  planName?: string;
  product?: BillingProductSnapshot;
  status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive';
  interval?: BillingInterval;
  renewAt?: string;
  cancelAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  autoRenew?: boolean;
}

export interface BillingCreditsState {
  balance: number;
  used?: number;
  reserved?: number;
  unit?: string;
  updatedAt?: string;
}

export interface BillingProductState {
  productKey: string;
  productId?: string;
  title?: string;
  kind: 'product';
  status?: 'active' | 'inactive' | 'archived';
  quantity?: number;
  owned?: boolean;
  creditsBalance?: number;
  creditGrant?: BillingItem['creditGrant'];
  creditRedeem?: BillingItem['creditRedeem'];
  updatedAt?: string;
}

export interface BillingOrderHistoryItem {
  orderId: string;
  productKey?: string;
  productId?: string;
  productTitle?: string;
  kind?: 'subscription' | 'product';
  quantity?: number;
  amount?: number;
  currency?: string;
  status?: 'pending' | 'paid' | 'failed' | 'canceled' | 'refunded';
  paymentId?: string;
  transactionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BillingPaymentHistoryItem {
  paymentId: string;
  orderId?: string;
  productKey?: string;
  amount?: number;
  currency?: string;
  status?: 'pending' | 'paid' | 'failed' | 'canceled' | 'refunded';
  transactionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BillingSubscriptionHistoryItem {
  subscriptionId: string;
  product?: BillingProductSnapshot;
  planKey?: string;
  planName?: string;
  status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive';
  interval?: BillingInterval;
  orderId?: string;
  paymentId?: string;
  startedAt?: string;
  endedAt?: string;
  updatedAt?: string;
}

export interface BillingEntitlementState {
  features?: string[];
  limits?: Record<string, number>;
  flags?: Record<string, boolean>;
}

export interface BillingStatusState {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastFetchedAt?: string;
}

export interface BillingPurchaseStatus {
  actionKey?: string;
  orderId?: string;
  paymentId?: string;
  transactionId?: string;
  status: 'idle' | 'pending' | 'requires_payment' | 'paid' | 'failed' | 'canceled' | 'refunded';
  orderStatus?: string;
  paymentStatus?: string;
  transactionStatus?: string;
  redirectTo?: string;
  updatedAt?: string;
}

export interface BillingApiClient {
  fetchRuntimeConfig: (catalogKey: string) => Promise<BillingRuntimeConfig | BillingCatalogConfig>;
  fetchSubscription: (args: { userId?: string; catalogKey?: string }) => Promise<BillingSubscriptionState>;
  fetchSubscriptionHistory: (args: { userId?: string; catalogKey?: string }) => Promise<BillingSubscriptionHistoryItem[]>;
  fetchProducts: (args: { userId?: string; catalogKey?: string }) => Promise<BillingProductState[]>;
  fetchOrderHistory: (args: { userId?: string; catalogKey?: string; productKey?: string }) => Promise<BillingOrderHistoryItem[]>;
  fetchPaymentHistory: (args: { userId?: string; catalogKey?: string }) => Promise<BillingPaymentHistoryItem[]>;
  fetchPurchaseStatus: (args: { orderId?: string; paymentId?: string; transactionId?: string }) => Promise<BillingPurchaseStatus>;
  fetchCredits: (args: { userId?: string; catalogKey?: string }) => Promise<BillingCreditsState>;
  fetchEntitlements: (args: { userId?: string; catalogKey?: string }) => Promise<BillingEntitlementState>;
  createAction: (payload: BillingActionPayload) => Promise<{
    redirectTo?: string;
    nextAction?: string;
    status?: 'pending' | 'succeeded' | 'failed';
  }>;
  refresh: (args: { userId?: string; catalogKey?: string }) => Promise<void>;
}

export interface BillingLoaders {
  runtimeConfigLoader?: (catalogKey: string) => Promise<BillingRuntimeConfig | BillingCatalogConfig>;
  subscriptionLoader?: (args: { userId?: string; catalogKey?: string }) => Promise<BillingSubscriptionState>;
  subscriptionHistoryLoader?: (args: { userId?: string; catalogKey?: string }) => Promise<BillingSubscriptionHistoryItem[]>;
  productsLoader?: (args: { userId?: string; catalogKey?: string }) => Promise<BillingProductState[]>;
  orderHistoryLoader?: (args: { userId?: string; catalogKey?: string; productKey?: string }) => Promise<BillingOrderHistoryItem[]>;
  paymentHistoryLoader?: (args: { userId?: string; catalogKey?: string }) => Promise<BillingPaymentHistoryItem[]>;
  purchaseStatusLoader?: (args: { orderId?: string; paymentId?: string; transactionId?: string }) => Promise<BillingPurchaseStatus>;
  creditsLoader?: (args: { userId?: string; catalogKey?: string }) => Promise<BillingCreditsState>;
  entitlementsLoader?: (args: { userId?: string; catalogKey?: string }) => Promise<BillingEntitlementState>;
}

export interface BillingActionExecutor {
  (payload: BillingActionPayload): Promise<{
    redirectTo?: string;
    nextAction?: string;
    status?: 'pending' | 'succeeded' | 'failed';
  }>;
}

export interface BillingSubscriptionContextValue {
  availablePlans?: BillingItem[];
  subscription?: BillingSubscriptionState;
  subscriptionHistory?: BillingSubscriptionHistoryItem[];
  entitlements?: BillingEntitlementState;
  status?: BillingStatusState;
}

export interface BillingProductContextValue {
  availableProducts?: BillingItem[];
  products?: BillingProductState[];
  orderHistory?: BillingOrderHistoryItem[];
  paymentHistory?: BillingPaymentHistoryItem[];
  status?: BillingStatusState;
}

export interface BillingCreditsContextValue {
  credits?: BillingCreditsState;
  status?: BillingStatusState;
}

export interface BillingCoreContextValue {
  apiClient: BillingApiClient;
  runtimeConfigLoader?: BillingLoaders['runtimeConfigLoader'];
  loaders?: BillingLoaders;
  actionExecutor?: BillingActionExecutor;
  defaults?: BillingDefaults;
  runtimeConfig?: BillingRuntimeConfig;
  runtimeCatalog?: BillingCatalogConfig;
  runtimeConfigLoading: boolean;
  runtimeConfigError: string | null;
  subscription?: BillingSubscriptionState;
  subscriptionHistory?: BillingSubscriptionHistoryItem[];
  products?: BillingProductState[];
  orderHistory?: BillingOrderHistoryItem[];
  paymentHistory?: BillingPaymentHistoryItem[];
  availablePlans?: BillingItem[];
  availableProducts?: BillingItem[];
  credits?: BillingCreditsState;
  entitlements?: BillingEntitlementState;
  purchaseStatus?: BillingPurchaseStatus;
  status: BillingStatusState;
  refresh: () => Promise<void>;
  runAction: (payload: BillingActionPayload) => Promise<{
    redirectTo?: string;
    nextAction?: string;
    status?: 'pending' | 'succeeded' | 'failed';
  }>;
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
}
