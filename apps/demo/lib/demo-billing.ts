import type {
  BillingApiClient,
  BillingActionPayload,
  BillingCatalogConfig,
  BillingCasdoorAccountResponse,
  BillingCasdoorApplicationResponse,
  BillingCasdoorOrderResponse,
  BillingCasdoorOrdersResponse,
  BillingCasdoorPaymentResponse,
  BillingCasdoorPlanResponse,
  BillingCasdoorPricingResponse,
  BillingCasdoorProductResponse,
  BillingCasdoorSubscriptionResponse,
  BillingCasdoorSubscriptionsResponse,
  BillingCreditsState,
  BillingEntitlementState,
  BillingItem,
  BillingOrderHistoryItem,
  BillingPaymentHistoryItem,
  BillingPurchaseStatus,
  BillingSubscriptionHistoryItem,
  BillingSubscriptionState,
  BillingProductState,
} from '@foldspace-fe/casdoor-next-auth-kit/billing';

const demoTimestamp = '2026-07-30T08:00:00.000Z';

const demoSubscriptionItem: BillingItem = {
  key: 'membership-monthly',
  kind: 'subscription',
  title: '会员月度计划',
  description: '本地演示的订阅计划，所有跳转都保留在当前 Next.js 应用内。',
  featured: true,
  badge: 'Popular',
  priceLabel: '¥29 / 月',
  priceValue: 2900,
  interval: 'month',
  features: ['登录后本地显示角色', '订阅状态面板', '积分余额展示'],
  backendRef: {
    productId: 'demo/membership',
    planId: 'membership-monthly',
  },
};

const demoProductItem: BillingItem = {
  key: 'credits-50',
  kind: 'product',
  title: '积分包 50',
  description: '一次性购买积分，购买动作同样保持站内跳转。',
  priceLabel: '¥9.9',
  priceValue: 990,
  credits: 50,
  features: ['50 点积分', '适合测试购买流程', '不删除 Casdoor 数据'],
  backendRef: {
    productId: 'demo/credits-50',
  },
  creditGrant: {
    creditsPerUnit: 50,
    unitName: 'pack',
  },
};

export const demoBillingRuntimeConfig: BillingCatalogConfig = {
  catalogKey: 'demo',
  title: 'Foldspace Demo Catalog',
  description: 'Local SaaS auth and billing surface for smoke testing.',
  portalPath: '/me',
  successPath: '/orders',
  cancelPath: '/me',
  items: [demoSubscriptionItem, demoProductItem],
  purchasableIds: ['membership-monthly', 'credits-50'],
  defaults: {
    defaultReturnTo: '/me',
    defaultQuantity: 1,
    defaultInterval: 'month',
  },
};

const demoSubscription: BillingSubscriptionState = {
  subscriptionId: 'sub_demo_001',
  planKey: demoSubscriptionItem.key,
  planName: 'membership-monthly',
  product: {
    productKey: demoSubscriptionItem.key,
    productId: demoSubscriptionItem.backendRef.productId,
    title: demoSubscriptionItem.title,
    kind: 'subscription',
    planId: demoSubscriptionItem.backendRef.planId,
    interval: 'month',
    metadata: {
      source: 'demo',
    },
  },
  status: 'active',
  interval: 'month',
  renewAt: '2026-08-30T08:00:00.000Z',
  currentPeriodStart: '2026-07-30T08:00:00.000Z',
  currentPeriodEnd: '2026-08-30T08:00:00.000Z',
  autoRenew: true,
};

const demoSubscriptionHistory: BillingSubscriptionHistoryItem[] = [
  {
    subscriptionId: demoSubscription.subscriptionId ?? 'sub_demo_001',
    product: demoSubscription.product,
    planKey: demoSubscription.planKey,
    planName: demoSubscription.planName,
    status: 'active',
    interval: 'month',
    orderId: 'order_demo_sub_001',
    paymentId: 'pay_demo_sub_001',
    startedAt: demoTimestamp,
    updatedAt: demoTimestamp,
  },
];

const demoProducts: BillingProductState[] = [
  {
    productKey: demoProductItem.key,
    productId: demoProductItem.backendRef.productId,
    title: demoProductItem.title,
    kind: 'product',
    status: 'active',
    quantity: 1,
    owned: true,
    creditsBalance: 50,
    creditGrant: demoProductItem.creditGrant,
    updatedAt: demoTimestamp,
  },
];

const demoOrders: BillingOrderHistoryItem[] = [
  {
    orderId: 'order_demo_sub_001',
    productKey: demoSubscriptionItem.key,
    productId: demoSubscriptionItem.backendRef.productId,
    productTitle: demoSubscriptionItem.title,
    kind: 'subscription',
    quantity: 1,
    amount: 2900,
    currency: 'CNY',
    status: 'paid',
    paymentId: 'pay_demo_sub_001',
    transactionId: 'txn_demo_sub_001',
    createdAt: demoTimestamp,
    updatedAt: demoTimestamp,
  },
  {
    orderId: 'order_demo_credit_001',
    productKey: demoProductItem.key,
    productId: demoProductItem.backendRef.productId,
    productTitle: demoProductItem.title,
    kind: 'product',
    quantity: 1,
    amount: 990,
    currency: 'CNY',
    status: 'paid',
    paymentId: 'pay_demo_credit_001',
    transactionId: 'txn_demo_credit_001',
    createdAt: demoTimestamp,
    updatedAt: demoTimestamp,
  },
];

const demoPayments: BillingPaymentHistoryItem[] = [
  {
    paymentId: 'pay_demo_sub_001',
    orderId: 'order_demo_sub_001',
    productKey: demoSubscriptionItem.key,
    amount: 2900,
    currency: 'CNY',
    status: 'paid',
    transactionId: 'txn_demo_sub_001',
    createdAt: demoTimestamp,
    updatedAt: demoTimestamp,
  },
  {
    paymentId: 'pay_demo_credit_001',
    orderId: 'order_demo_credit_001',
    productKey: demoProductItem.key,
    amount: 990,
    currency: 'CNY',
    status: 'paid',
    transactionId: 'txn_demo_credit_001',
    createdAt: demoTimestamp,
    updatedAt: demoTimestamp,
  },
];

const demoCredits: BillingCreditsState = {
  balance: 2580,
  used: 420,
  reserved: 0,
  unit: 'credits',
  updatedAt: demoTimestamp,
};

const demoEntitlements: BillingEntitlementState = {
  features: ['billing-dashboard', 'subscription-management', 'credits-purchase'],
  limits: {
    seats: 10,
    apiCallsPerDay: 250000,
  },
  flags: {
    hasActiveSubscription: true,
    hasCredits: true,
  },
};

const demoAccountResponse: BillingCasdoorAccountResponse = {
  status: 'ok',
  msg: 'ok',
  sub: '',
  name: 'demo-account',
  data: {
    owner: 'demo',
    name: 'demo-user',
    id: 'demo-user',
    displayName: 'Demo User',
    email: 'demo@example.com',
    isAdmin: false,
    roles: ['user'],
    balanceCredit: demoCredits.balance,
    balanceCurrency: 'credits',
  },
  data2: null,
  data3: null,
};

const demoApplicationResponse: BillingCasdoorApplicationResponse = {
  status: 'ok',
  msg: 'ok',
  sub: '',
  name: 'demo-application',
  data: {
    owner: 'demo',
    name: 'demo-app',
    organization: 'demo-org',
    displayName: 'demo-app',
    enableSignUp: true,
    enableSigninSession: true,
    providers: [
      {
        name: 'demo-provider',
        provider: {
          name: 'demo-provider',
          title: 'Demo Provider',
          owner: 'demo',
        },
      },
    ],
  },
  data2: null,
  data3: null,
};

const demoPricingResponse: BillingCasdoorPricingResponse = {
  status: 'ok',
  msg: 'ok',
  sub: '',
  name: 'membership-monthly',
  data: {
    owner: 'demo',
    name: 'membership-monthly',
    displayName: '会员月度计划',
    description: '本地演示订阅定价',
    plans: ['membership-monthly-basic'],
    isEnabled: true,
    application: 'demo-app',
  },
  data2: null,
  data3: null,
};

const demoPlanResponse: BillingCasdoorPlanResponse = {
  status: 'ok',
  msg: 'ok',
  sub: '',
  name: 'membership-monthly-basic',
  data: {
    owner: 'demo',
    name: 'membership-monthly-basic',
    displayName: '会员月度计划',
    description: '本地演示计划',
    price: 2900,
    currency: 'CNY',
    period: 'month',
    product: 'demo/membership',
    paymentProviders: ['demo-provider'],
    isEnabled: true,
    role: 'user',
    options: {
      featured: true,
    },
  },
  data2: null,
  data3: null,
};

const demoProductResponse: BillingCasdoorProductResponse = {
  status: 'ok',
  msg: 'ok',
  sub: '',
  name: 'credits-50',
  data: {
    owner: 'demo',
    name: 'credits-50',
    displayName: '积分包 50',
    description: '本地演示商品',
    providers: ['demo-provider'],
    providerObjs: [
      {
        name: 'demo-provider',
        title: 'Demo Provider',
        owner: 'demo',
        method: 'mock',
      },
    ],
    successUrl: '/orders?status=paid',
    returnUrl: '/me',
    price: 990,
    currency: 'CNY',
    quantity: 1,
    sold: 1,
    isRecharge: true,
    state: 'active',
  },
  data2: null,
  data3: null,
};

const demoOrderResponse = (id: string): BillingCasdoorOrderResponse => ({
  status: 'ok',
  msg: 'ok',
  sub: '',
  name: id,
  data: {
    owner: 'demo',
    name: id,
    displayName: id,
    user: 'demo-user',
    product: 'credits-50',
    productDisplayName: '积分包 50',
    products: ['credits-50'],
    price: 990,
    amount: 990,
    currency: 'CNY',
    quantity: 1,
    provider: 'demo-provider',
    payment: 'pay_demo_credit_001',
    transaction: 'txn_demo_credit_001',
    successUrl: '/orders?status=paid',
    returnUrl: '/me',
    state: 'paid',
  },
  data2: null,
  data3: null,
});

const demoOrdersResponse: BillingCasdoorOrdersResponse = {
  status: 'ok',
  msg: 'ok',
  sub: '',
  name: 'orders',
  data: [
    demoOrderResponse('order_demo_sub_001').data,
    demoOrderResponse('order_demo_credit_001').data,
  ],
  data2: null,
  data3: null,
};

const demoSubscriptionResponse: BillingCasdoorSubscriptionResponse = {
  status: 'ok',
  msg: 'ok',
  sub: '',
  name: 'sub_demo_001',
  data: {
    owner: 'demo',
    name: 'sub_demo_001',
    displayName: 'Demo Subscription',
    description: '当前账号的示例订阅',
    duration: 30,
    startTime: '2026-07-30T08:00:00.000Z',
    endTime: '2026-08-30T08:00:00.000Z',
    pricing: 'membership-monthly',
    plan: 'membership-monthly-basic',
    payment: 'pay_demo_sub_001',
    user: 'demo-user',
    state: 'Active',
  },
  data2: null,
  data3: null,
};

const demoSubscriptionsResponse: BillingCasdoorSubscriptionsResponse = {
  status: 'ok',
  msg: 'ok',
  sub: '',
  name: 'subscriptions',
  data: [demoSubscriptionResponse.data],
  data2: null,
  data3: null,
};

const demoPaymentResponse = (id: string): BillingCasdoorPaymentResponse => ({
  status: 'ok',
  msg: 'ok',
  sub: '',
  name: id,
  data: {
    owner: 'demo',
    name: id,
    displayName: id,
    provider: 'demo-provider',
    type: 'mock',
    productName: 'credits-50',
    productDisplayName: '积分包 50',
    currency: 'CNY',
    price: 990,
    returnUrl: '/me',
    isRecharge: true,
    user: 'demo-user',
    personName: 'Demo User',
    state: 'paid',
    message: 'demo payment',
    outOrderId: 'order_demo_credit_001',
    payUrl: '/orders?status=paid',
    successUrl: '/orders?status=paid',
  },
  data2: null,
  data3: null,
});

const demoPaymentsResponse = {
  status: 'ok',
  msg: 'ok',
  sub: '',
  name: 'payments',
  data: [demoPaymentResponse('pay_demo_sub_001').data, demoPaymentResponse('pay_demo_credit_001').data],
  data2: null,
  data3: null,
};

function asJson<T>(data: T): { data: T } {
  return { data };
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function resolvePurchaseStatus(): BillingPurchaseStatus {
  return {
    status: 'paid',
    orderId: 'order_demo_credit_001',
    paymentId: 'pay_demo_credit_001',
    transactionId: 'txn_demo_credit_001',
    orderStatus: 'paid',
    paymentStatus: 'paid',
    transactionStatus: 'paid',
    updatedAt: demoTimestamp,
  };
}

export const demoBillingApiClient: BillingApiClient = {
  async fetchRuntimeConfig() {
    return clone(demoBillingRuntimeConfig);
  },
  async fetchSubscription() {
    return clone(demoSubscription);
  },
  async fetchSubscriptionHistory() {
    return clone(demoSubscriptionHistory);
  },
  async fetchProducts() {
    return clone(demoProducts);
  },
  async fetchOrderHistory() {
    return clone(demoOrders);
  },
  async fetchPaymentHistory() {
    return clone(demoPayments);
  },
  async fetchPurchaseStatus() {
    return resolvePurchaseStatus();
  },
  async fetchCredits() {
    return clone(demoCredits);
  },
  async fetchEntitlements() {
    return clone(demoEntitlements);
  },
  async fetchPricing() {
    return clone(demoPricingResponse);
  },
  async fetchPlan() {
    return clone(demoPlanResponse);
  },
  async fetchOrder({ id }: { id: string }) {
    return clone(id === 'order_demo_sub_001' ? demoOrderResponse('order_demo_sub_001') : demoOrderResponse(id));
  },
  async fetchOrders() {
    return clone(demoOrdersResponse);
  },
  async fetchSubscriptionRecord() {
    return clone(demoSubscriptionResponse);
  },
  async fetchSubscriptions() {
    return clone(demoSubscriptionsResponse);
  },
  async fetchAccount() {
    return clone(demoAccountResponse);
  },
  async fetchApplication() {
    return clone(demoApplicationResponse);
  },
  async fetchPayment({ id }: { id?: string }) {
    const paymentId = id ?? 'pay_demo_credit_001';
    return clone(paymentId === 'pay_demo_sub_001' ? demoPaymentResponse('pay_demo_sub_001') : demoPaymentResponse(paymentId));
  },
  async fetchProduct() {
    return clone(demoProductResponse);
  },
  async createAction(payload: BillingActionPayload) {
    const nextAction = payload.kind === 'purchase' ? 'open-payment' : 'open-subscription';
    const redirectTo = payload.kind === 'purchase' ? '/orders?status=paid' : '/subscriptions?status=active';
    return {
      status: 'succeeded',
      redirectTo,
      nextAction,
      message: `${payload.kind} completed locally`,
      rawResult: {
        payload,
        redirectTo,
      },
    };
  },
  async refresh() {
    return;
  },
};
