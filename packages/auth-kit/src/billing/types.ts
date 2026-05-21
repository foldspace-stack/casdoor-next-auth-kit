export type BillingItemKind = 'subscription' | 'product';
export type BillingInterval = 'month' | 'year';
export type BillingPurchasableKind = BillingItemKind;

export interface BillingPurchasableEntryBase {
  key: string;
  kind: BillingPurchasableKind;
  title: string;
  description?: string;
  enabled?: boolean;
  hooks?: BillingPurchaseHooks;
}

export interface BillingSubscriptionPurchasableEntry extends BillingPurchasableEntryBase {
  kind: 'subscription';
  backendRef: {
    productId: string;
    planId?: string;
    priceId?: string;
  };
  interval?: BillingInterval;
}

export interface BillingProductPurchasableEntry extends BillingPurchasableEntryBase {
  kind: 'product';
  backendRef: {
    productId: string;
    priceId?: string;
  };
  quantity?: number;
  creditGrant?: {
    creditsPerUnit: number;
    unitName?: string;
  };
  creditRedeem?: {
    productKey: string;
    creditsPerUnit: number;
  };
}

export type BillingPurchasableEntry =
  | BillingSubscriptionPurchasableEntry
  | BillingProductPurchasableEntry;

export interface BillingPurchasableWhitelist {
  purchasableIds?: string[];
  purchasables?: BillingPurchasableEntry[];
}

export interface BillingPurchaseRequest {
  kind: BillingPurchasableKind;
  key: string;
  productId: string;
  productOwner?: string;
  productName?: string;
  providerName?: string;
  pricingName?: string;
  planName?: string;
  userName?: string;
  paymentEnv?: string;
  customPrice?: number;
  quantity?: number;
  returnTo?: string;
  metadata?: Record<string, string>;
}

export interface BillingCasdoorErrorDetail {
  field?: string;
  value?: string;
  issue?: string;
  location?: string;
  [key: string]: unknown;
}

export interface BillingCasdoorProviderOption {
  name: string;
  owner?: string;
  title?: string;
  description?: string;
}

export interface BillingCasdoorProviderDetail extends BillingCasdoorProviderOption {
  createdTime?: string;
  displayName?: string;
  category?: string;
  type?: string;
  subType?: string;
  method?: string;
  clientId?: string;
  clientSecret?: string;
  clientId2?: string;
  clientSecret2?: string;
  cert?: string;
  customAuthUrl?: string;
  customTokenUrl?: string;
  customUserInfoUrl?: string;
  customLogo?: string;
  scopes?: string;
  userMapping?: Record<string, string>;
  httpHeaders?: Record<string, string> | null;
  host?: string;
  port?: number;
  disableSsl?: boolean;
  content?: string;
  receiver?: string;
  regionId?: string;
  signName?: string;
  templateCode?: string;
  appId?: string;
  endpoint?: string;
  intranetEndpoint?: string;
  domain?: string;
  bucket?: string;
  pathPrefix?: string;
  metadata?: string;
  idP?: string;
  issuerUrl?: string;
  enableSignAuthnRequest?: boolean;
  emailRegex?: string;
  providerUrl?: string;
  enableProxy?: boolean;
}

export interface BillingCasdoorOrganizationOption {
  name: string;
  displayName?: string;
}

export interface BillingCasdoorOrganizationDetail extends BillingCasdoorOrganizationOption {
  owner?: string;
  createdTime?: string;
  websiteUrl?: string;
  logo?: string;
  logoDark?: string;
  favicon?: string;
  hasPrivilegeConsent?: boolean;
  passwordType?: string;
  passwordSalt?: string;
  passwordOptions?: unknown;
  passwordObfuscatorType?: string;
  passwordObfuscatorKey?: string;
  passwordExpireDays?: number;
  countryCodes?: string[] | null;
  defaultAvatar?: string;
  defaultApplication?: string;
  userTypes?: unknown;
  tags?: unknown;
  languages?: string[] | null;
  themeData?: unknown;
  masterPassword?: string;
  defaultPassword?: string;
  masterVerificationCode?: string;
  ipWhitelist?: string;
  initScore?: number;
  enableSoftDeletion?: boolean;
  isProfilePublic?: boolean;
  useEmailAsUsername?: boolean;
  enableTour?: boolean;
  disableSignin?: boolean;
  ipRestriction?: string;
  navItems?: string[] | null;
  userNavItems?: unknown;
  widgetItems?: unknown;
  mfaItems?: unknown;
  mfaRememberInHours?: number;
  accountItems?: unknown;
  orgBalance?: number;
  userBalance?: number;
  balanceCredit?: number;
  balanceCurrency?: string;
}

export interface BillingCasdoorProductDetail {
  owner: string;
  name: string;
  createdTime?: string;
  displayName?: string;
  image?: string;
  detail?: string;
  description?: string;
  tag?: string;
  providers?: string[];
  providerObjs?: BillingCasdoorProviderDetail[];
  successUrl?: string;
  returnUrl?: string;
  price?: number;
  currency?: string;
  quantity?: number;
  sold?: number;
  isRecharge?: boolean;
  state?: string;
}

export interface BillingCasdoorErrorPayload {
  code?: string;
  message?: string;
  detail?: BillingCasdoorErrorDetail;
  [key: string]: unknown;
}

export interface BillingCasdoorApiResponse<TData = unknown> {
  status: string;
  msg: string;
  sub: string;
  name: string;
  data: TData;
  data2: unknown | null;
  data3: unknown | null;
}

export interface BillingCasdoorQueryState<TData> {
  data?: TData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export type BillingCasdoorProductResponse = BillingCasdoorApiResponse<BillingCasdoorProductDetail>;

export interface BillingCasdoorPricingDetail {
  owner: string;
  name: string;
  createdTime?: string;
  displayName?: string;
  description?: string;
  plans?: string[];
  isEnabled?: boolean;
  trialDuration?: number;
  application?: string;
  [key: string]: unknown;
}

export type BillingCasdoorPricingResponse = BillingCasdoorApiResponse<BillingCasdoorPricingDetail>;

export interface BillingCasdoorPlanDetail {
  owner: string;
  name: string;
  createdTime?: string;
  displayName?: string;
  description?: string;
  price?: number;
  currency?: string;
  period?: string;
  product?: string;
  paymentProviders?: string[];
  isEnabled?: boolean;
  role?: string;
  options?: unknown;
  [key: string]: unknown;
}

export type BillingCasdoorPlanResponse = BillingCasdoorApiResponse<BillingCasdoorPlanDetail>;

export interface BillingCasdoorAccountMultiFactorAuthDetail {
  enabled: boolean;
  isPreferred: boolean;
  mfaType: string;
  mfaRememberInHours: number;
}

export interface BillingCasdoorAccountDetail {
  owner: string;
  name: string;
  createdTime?: string;
  updatedTime?: string;
  deletedTime?: string;
  id?: string;
  externalId?: string;
  type?: string;
  password?: string;
  passwordSalt?: string;
  passwordType?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  avatarType?: string;
  permanentAvatar?: string;
  email?: string;
  emailVerified?: boolean;
  phone?: string;
  countryCode?: string;
  region?: string;
  location?: string;
  address?: string[] | null;
  affiliation?: string;
  title?: string;
  idCardType?: string;
  idCard?: string;
  homepage?: string;
  bio?: string;
  tag?: string;
  language?: string;
  gender?: string;
  birthday?: string;
  education?: string;
  score?: number;
  karma?: number;
  ranking?: number;
  balance?: number;
  balanceCredit?: number;
  currency?: string;
  balanceCurrency?: string;
  isDefaultAvatar?: boolean;
  isOnline?: boolean;
  isAdmin?: boolean;
  isForbidden?: boolean;
  isDeleted?: boolean;
  signupApplication?: string;
  hash?: string;
  preHash?: string;
  registerType?: string;
  registerSource?: string;
  accessKey?: string;
  accessSecret?: string;
  accessToken?: string;
  originalToken?: string;
  createdIp?: string;
  lastSigninTime?: string;
  lastSigninIp?: string;
  properties?: Record<string, string>;
  roles?: string[];
  permissions?: string[];
  groups?: string[];
  lastChangePasswordTime?: string;
  lastSigninWrongTime?: string;
  signinWrongTimes?: number;
  managedAccounts?: unknown[] | null;
  mfaAccounts?: unknown[] | null;
  mfaItems?: unknown[] | null;
  mfaRememberDeadline?: string;
  needUpdatePassword?: boolean;
  ipWhitelist?: string;
  webauthnCredentials?: unknown[] | null;
  preferredMfaType?: string;
  recoveryCodes?: string[] | null;
  totpSecret?: string;
  mfaPhoneEnabled?: boolean;
  mfaEmailEnabled?: boolean;
  mfaRadiusEnabled?: boolean;
  mfaRadiusUsername?: string;
  mfaRadiusProvider?: string;
  mfaPushEnabled?: boolean;
  mfaPushReceiver?: string;
  mfaPushProvider?: string;
  multiFactorAuths?: BillingCasdoorAccountMultiFactorAuthDetail[];
  invitation?: string;
  invitationCode?: string;
  faceIds?: unknown[] | null;
  ldap?: string;
  [key: string]: unknown;
}

export type BillingCasdoorAccountResponse = BillingCasdoorApiResponse<BillingCasdoorAccountDetail>;

export interface BillingCasdoorApplicationProviderDetail {
  owner?: string;
  name?: string;
  canSignUp?: boolean;
  canSignIn?: boolean;
  canUnlink?: boolean;
  countryCodes?: string[] | null;
  prompted?: boolean;
  signupGroup?: string;
  rule?: string;
  provider?: BillingCasdoorProviderDetail;
}

export interface BillingCasdoorApplicationSigninMethodDetail {
  name?: string;
  displayName?: string;
  rule?: string;
}

export interface BillingCasdoorApplicationSignupItemDetail {
  name?: string;
  visible?: boolean;
  required?: boolean;
  prompted?: boolean;
  type?: string;
  customCss?: string;
  label?: string;
  placeholder?: string;
  options?: string[] | null;
  regex?: string;
  rule?: string;
}

export interface BillingCasdoorApplicationSigninItemDetail {
  name?: string;
  visible?: boolean;
  label?: string;
  customCss?: string;
  placeholder?: string;
  rule?: string;
  isCustom?: boolean;
}

export interface BillingCasdoorApplicationDetail extends BillingCasdoorOrganizationDetail {
  organization?: string;
  cert?: string;
  defaultGroup?: string;
  headerHtml?: string;
  enablePassword?: boolean;
  enableSignUp?: boolean;
  disableSignin?: boolean;
  enableSigninSession?: boolean;
  enableAutoSignin?: boolean;
  enableCodeSignin?: boolean;
  enableExclusiveSignin?: boolean;
  enableSamlCompress?: boolean;
  enableSamlC14n10?: boolean;
  enableSamlPostBinding?: boolean;
  useEmailAsSamlNameId?: boolean;
  enableWebAuthn?: boolean;
  enableLinkWithEmail?: boolean;
  orgChoiceMode?: string;
  samlReplyUrl?: string;
  providers?: BillingCasdoorApplicationProviderDetail[];
  signinMethods?: BillingCasdoorApplicationSigninMethodDetail[];
  signupItems?: BillingCasdoorApplicationSignupItemDetail[];
  signinItems?: BillingCasdoorApplicationSigninItemDetail[];
  grantTypes?: string[];
  organizationObj?: BillingCasdoorOrganizationDetail;
  certPublicKey?: string;
  tags?: string[];
  samlAttributes?: Record<string, string> | null;
  samlHashAlgorithm?: string;
  isShared?: boolean;
  ipRestriction?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUris?: string[];
  forcedRedirectOrigin?: string;
  tokenFormat?: string;
  tokenSigningMethod?: string;
  tokenFields?: string[];
  tokenAttributes?: string[];
  expireInHours?: number;
  refreshExpireInHours?: number;
  signupUrl?: string;
  signinUrl?: string;
  forgetUrl?: string;
  affiliationUrl?: string;
  termsOfUse?: string;
  signupHtml?: string;
  signinHtml?: string;
  themeData?: unknown;
  footerHtml?: string;
  formCss?: string;
  formCssMobile?: string;
  formOffset?: number;
  formSideHtml?: string;
  formBackgroundUrl?: string;
  formBackgroundUrlMobile?: string;
  failedSigninLimit?: number;
  failedSigninFrozenTime?: number;
  codeResendTimeout?: number;
}

export type BillingCasdoorApplicationResponse = BillingCasdoorApiResponse<BillingCasdoorApplicationDetail>;

export interface BillingCasdoorPaymentDetail {
  owner: string;
  name: string;
  createdTime?: string;
  displayName?: string;
  provider?: string;
  type?: string;
  productName?: string;
  productDisplayName?: string;
  detail?: string;
  tag?: string;
  currency?: string;
  price?: number;
  returnUrl?: string;
  isRecharge?: boolean;
  user?: string;
  personName?: string;
  personIdCard?: string;
  personEmail?: string;
  personPhone?: string;
  invoiceType?: string;
  invoiceTitle?: string;
  invoiceTaxId?: string;
  invoiceRemark?: string;
  invoiceUrl?: string;
  outOrderId?: string;
  payUrl?: string;
  successUrl?: string;
  state?: string;
  message?: string;
  [key: string]: unknown;
}

export type BillingCasdoorPaymentResponse = BillingCasdoorApiResponse<BillingCasdoorPaymentDetail>;

export interface BillingCasdoorOrderDetail {
  owner: string;
  name: string;
  createdTime?: string;
  displayName?: string;
  user?: string;
  product?: string;
  productDisplayName?: string;
  products?: string[];
  price?: number;
  amount?: number;
  currency?: string;
  quantity?: number;
  provider?: string;
  payment?: string;
  transaction?: string;
  successUrl?: string;
  returnUrl?: string;
  state?: string;
  [key: string]: unknown;
}

export type BillingCasdoorOrderResponse = BillingCasdoorApiResponse<BillingCasdoorOrderDetail>;
export type BillingCasdoorOrdersResponse = BillingCasdoorApiResponse<BillingCasdoorOrderDetail[]>;

export interface BillingCasdoorSubscriptionDetail {
  owner: string;
  name: string;
  createdTime?: string;
  displayName?: string;
  description?: string;
  duration?: number;
  startTime?: string;
  endTime?: string;
  pricing?: string;
  plan?: string;
  payment?: string;
  user?: string;
  state?: 'Pending' | 'Error' | 'Suspended' | 'Active' | 'Upcoming' | 'Expired' | string;
  [key: string]: unknown;
}

export type BillingCasdoorSubscriptionResponse = BillingCasdoorApiResponse<BillingCasdoorSubscriptionDetail>;
export type BillingCasdoorSubscriptionsResponse = BillingCasdoorApiResponse<BillingCasdoorSubscriptionDetail[]>;

export type BillingCasdoorOrganizationNamesResponse = BillingCasdoorApiResponse<BillingCasdoorOrganizationDetail[]>;

export interface BillingCasdoorBuyProductRequest {
  id: string;
  providerName: string;
  pricingName?: string;
  planName?: string;
  userName?: string;
  paymentEnv?: string;
  customPrice?: number;
}

export type BillingCasdoorBuyProductResponse = BillingCasdoorApiResponse<unknown>;

export interface BillingOrderCreatedContext {
  request: BillingPurchaseRequest;
  purchasable: BillingPurchasableEntry;
  orderId: string | null;
  paymentId: string | null;
  redirectTo: string | null;
  rawResult: unknown;
}

export interface BillingPurchaseErrorContext {
  request: BillingPurchaseRequest;
  orderId: string | null;
  paymentId: string | null;
  status: 'failed';
  message: string;
  errorCode?: string;
  redirectTo: string | null;
  rawResult: unknown;
}

export interface BillingPaymentCallbackContext {
  request: Request;
  url: URL;
  searchParams: URLSearchParams;
  params: Record<string, string>;
  body: unknown;
  paymentOwner: string | null;
  paymentName: string | null;
  paymentId: string | null;
  orderId: string | null;
  redirectTo: string | null;
  status: 'success' | 'failure' | 'finished';
}

export type BillingPaymentSuccessContext = BillingPaymentCallbackContext;

export interface BillingPaymentFinishedContext extends BillingPaymentCallbackContext {
  status: 'finished';
}

export interface BillingPurchaseCompleteContext {
  request: BillingPurchaseRequest;
  orderId: string | null;
  paymentId: string | null;
  status: 'succeeded' | 'failed' | 'canceled';
  redirectTo: string | null;
}

export interface BillingPurchaseHooks {
  onPurchaseStart?: (context: BillingPurchaseRequest) => void | Promise<void>;
  onOrderCreated?: (context: BillingOrderCreatedContext) => void | Promise<void>;
  onPurchaseError?: (context: BillingPurchaseErrorContext) => void | Promise<void>;
  onPaymentSuccess?: (context: BillingPaymentCallbackContext) => void | Promise<void>;
  onPaymentFailure?: (context: BillingPaymentCallbackContext) => void | Promise<void>;
  onPaymentFinished?: (context: BillingPaymentFinishedContext) => void | Promise<void>;
  onPurchaseComplete?: (context: BillingPurchaseCompleteContext) => void | Promise<void>;
}

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
  purchasableIds?: string[];
  purchasables?: BillingPurchasableEntry[];
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

export type BillingPaymentFinishedHandler = (
  context: BillingPaymentFinishedContext,
) => BillingPaymentSuccessHandlerResult | Promise<BillingPaymentSuccessHandlerResult>;

export interface BillingPaymentRouteBaseOptions {
  appUrl?: string;
  fallbackRedirect?: string;
}

export interface BillingPaymentSuccessRouteOptions extends BillingPaymentRouteBaseOptions {
  handler?: BillingPaymentSuccessHandler;
  phase?: 'success' | 'failure';
}

export interface BillingPaymentFinishedRouteOptions extends BillingPaymentRouteBaseOptions {
  handler?: BillingPaymentFinishedHandler;
  phase?: 'finished';
}

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
  providerName?: string;
  pricingName?: string;
  planName?: string;
  userName?: string;
  paymentEnv?: string;
  customPrice?: number;
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
  providers?: string[];
  providerObjs?: BillingCasdoorProviderDetail[];
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
  providers?: string[];
  providerObjs?: BillingCasdoorProviderDetail[];
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
  fetchPricing?: (args: { id: string }) => Promise<BillingCasdoorPricingResponse>;
  fetchPlan?: (args: { id: string; includeOption?: boolean }) => Promise<BillingCasdoorPlanResponse>;
  fetchOrder?: (args: { id: string }) => Promise<BillingCasdoorOrderResponse>;
  fetchOrders?: (args: { owner?: string; user?: string; product?: string }) => Promise<BillingCasdoorOrdersResponse>;
  fetchSubscriptionRecord?: (args: { id: string }) => Promise<BillingCasdoorSubscriptionResponse>;
  fetchSubscriptions?: (args: { owner?: string; user?: string }) => Promise<BillingCasdoorSubscriptionsResponse>;
  fetchAccount?: (args: { id?: string }) => Promise<BillingCasdoorAccountResponse>;
  fetchApplication?: (args: { id?: string }) => Promise<BillingCasdoorApplicationResponse>;
  fetchPayment?: (args: { id?: string }) => Promise<BillingCasdoorPaymentResponse>;
  fetchProduct?: (args: { id: string }) => Promise<BillingCasdoorProductResponse>;
  fetchOrganizationNames?: (args: { owner: string }) => Promise<BillingCasdoorOrganizationNamesResponse>;
  buyProduct?: (args: BillingCasdoorBuyProductRequest) => Promise<BillingCasdoorBuyProductResponse>;
  createAction: (payload: BillingActionPayload) => Promise<BillingActionExecutionResult>;
  refresh: (args: { userId?: string; catalogKey?: string }) => Promise<void>;
}

export interface BillingActionExecutionResult {
  redirectTo?: string;
  nextAction?: string;
  status?: 'pending' | 'succeeded' | 'failed';
  message?: string;
  errorCode?: string;
  orderId?: string;
  paymentId?: string;
  transactionId?: string;
  rawResult?: unknown;
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
  pricingLoader?: (args: { id: string }) => Promise<BillingCasdoorPricingResponse>;
  planLoader?: (args: { id: string; includeOption?: boolean }) => Promise<BillingCasdoorPlanResponse>;
  orderLoader?: (args: { id: string }) => Promise<BillingCasdoorOrderResponse>;
  ordersLoader?: (args: { owner?: string; user?: string; product?: string }) => Promise<BillingCasdoorOrdersResponse>;
  subscriptionRecordLoader?: (args: { id: string }) => Promise<BillingCasdoorSubscriptionResponse>;
  subscriptionsLoader?: (args: { owner?: string; user?: string }) => Promise<BillingCasdoorSubscriptionsResponse>;
  accountLoader?: (args: { id?: string }) => Promise<BillingCasdoorAccountResponse>;
  applicationLoader?: (args: { id?: string }) => Promise<BillingCasdoorApplicationResponse>;
  paymentLoader?: (args: { id?: string }) => Promise<BillingCasdoorPaymentResponse>;
  productLoader?: (args: { id: string }) => Promise<BillingCasdoorProductResponse>;
  organizationNamesLoader?: (args: { owner: string }) => Promise<BillingCasdoorOrganizationNamesResponse>;
  buyProductLoader?: (args: BillingCasdoorBuyProductRequest) => Promise<BillingCasdoorBuyProductResponse>;
}

export interface BillingActionExecutor {
  (payload: BillingActionPayload): Promise<BillingActionExecutionResult>;
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

export interface BillingProductDetailState {
  product?: BillingCasdoorProductDetail;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
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
  purchaseHooks?: BillingPurchaseHooks;
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
}
