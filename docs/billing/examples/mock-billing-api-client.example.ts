import type {
  BillingApiClient,
  BillingCasdoorBuyProductRequest,
  BillingCasdoorBuyProductResponse,
  BillingCasdoorOrderResponse,
  BillingCasdoorOrdersResponse,
  BillingCasdoorOrganizationNamesResponse,
  BillingCasdoorPlanResponse,
  BillingCasdoorPricingResponse,
  BillingCasdoorProductResponse,
  BillingCasdoorSubscriptionResponse,
  BillingCasdoorSubscriptionsResponse,
  BillingActionPayload,
  BillingCreditsState,
  BillingEntitlementState,
  BillingPurchaseStatus,
  BillingRuntimeConfig,
  BillingSubscriptionHistoryItem,
  BillingSubscriptionState,
  BillingProductState,
  BillingOrderHistoryItem,
  BillingPaymentHistoryItem,
} from '@foldspace-fe/casdoor-next-auth-kit/billing';

import { billingCatalogExample } from './billing-catalog.example';

const delay = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

export const mockBillingApiClient: BillingApiClient = {
  async fetchRuntimeConfig() {
    await delay(100);
    return billingCatalogExample satisfies BillingRuntimeConfig;
  },
  async fetchSubscription() {
    await delay(80);
    return {
      subscriptionId: 'sub_001',
      planKey: 'pro-year',
      planName: 'Pro',
      status: 'active',
      interval: 'year',
      renewAt: '2026-06-01T00:00:00.000Z',
      autoRenew: true,
    } satisfies BillingSubscriptionState;
  },
  async fetchSubscriptionHistory() {
    await delay(80);
    return [
      {
        subscriptionId: 'sub_001',
        planKey: 'starter-month',
        planName: 'Starter',
        status: 'canceled',
        interval: 'month',
        startedAt: '2025-01-01T00:00:00.000Z',
        endedAt: '2025-02-01T00:00:00.000Z',
      },
      {
        subscriptionId: 'sub_002',
        planKey: 'pro-year',
        planName: 'Pro',
        status: 'active',
        interval: 'year',
        startedAt: '2025-06-01T00:00:00.000Z',
      },
    ] satisfies BillingSubscriptionHistoryItem[];
  },
  async fetchPricing({ id }) {
    await delay(40);
    const [owner, ...rest] = id.split('/');
    return {
      status: 'ok',
      msg: '',
      sub: '',
      name: '',
      data: {
        owner,
        name: rest.join('/'),
        displayName: '创小剧会员订阅',
        plans: ['创小剧订阅测试'],
        isEnabled: true,
        trialDuration: 7,
      },
      data2: null,
      data3: null,
    } satisfies BillingCasdoorPricingResponse;
  },
  async fetchPlan({ id, includeOption }) {
    await delay(40);
    const [owner, ...rest] = id.split('/');
    return {
      status: 'ok',
      msg: '',
      sub: '',
      name: '',
      data: {
        owner,
        name: rest.join('/'),
        displayName: '创小剧订阅测试',
        price: 0.01,
        currency: 'CNY',
        period: 'Monthly',
        product: 'product_h24p63',
        paymentProviders: ['创小剧-微信支付'],
        isEnabled: true,
        options: includeOption ? { mocked: true } : null,
      },
      data2: null,
      data3: null,
    } satisfies BillingCasdoorPlanResponse;
  },
  async fetchProducts() {
    await delay(80);
    return [
      {
        productKey: 'credits-1000',
        productId: 'prod_credits_1000',
        title: '1000 Credits',
        kind: 'product',
        quantity: 1,
        owned: true,
        creditsBalance: 1000,
      },
      {
        productKey: 'avatar-pack',
        productId: 'prod_avatar_pack',
        title: 'Avatar Pack',
        kind: 'product',
        quantity: 1,
        owned: true,
      },
    ] satisfies BillingProductState[];
  },
  async fetchOrder({ id }) {
    await delay(40);
    const [owner, ...rest] = id.split('/');
    return {
      status: 'ok',
      msg: '',
      sub: '',
      name: '',
      data: {
        owner,
        name: rest.join('/'),
        product: 'qixiaoju/创小剧积分包-50',
        productDisplayName: '创小剧积分包-50',
        quantity: 1,
        price: 50,
        currency: 'CNY',
        state: 'Paid',
      },
      data2: null,
      data3: null,
    } satisfies BillingCasdoorOrderResponse;
  },
  async fetchOrders(_args: { owner?: string; user?: string; product?: string } = {}) {
    await delay(40);
    return {
      status: 'ok',
      msg: '',
      sub: '',
      name: '',
      data: [
        {
          owner: 'qixiaoju',
          name: 'order_001',
          product: 'qixiaoju/创小剧积分包-50',
          productDisplayName: '创小剧积分包-50',
          quantity: 1,
          price: 50,
          currency: 'CNY',
          state: 'Paid',
        },
      ],
      data2: null,
      data3: null,
    } satisfies BillingCasdoorOrdersResponse;
  },
  async fetchOrderHistory() {
    await delay(80);
    return [
      {
        orderId: 'ord_001',
        productKey: 'credits-1000',
        productId: 'prod_credits_1000',
        productTitle: '1000 Credits',
        kind: 'product',
        quantity: 1,
        amount: 1999,
        currency: 'USD',
        status: 'paid',
        createdAt: '2025-06-01T00:00:00.000Z',
      },
      {
        orderId: 'ord_002',
        productKey: 'avatar-pack',
        productId: 'prod_avatar_pack',
        productTitle: 'Avatar Pack',
        kind: 'product',
        quantity: 1,
        amount: 4999,
        currency: 'USD',
        status: 'paid',
        createdAt: '2025-06-10T00:00:00.000Z',
      },
    ] satisfies BillingOrderHistoryItem[];
  },
  async fetchPaymentHistory() {
    await delay(80);
    return [
      {
        paymentId: 'pay_001',
        orderId: 'ord_001',
        productKey: 'credits-1000',
        amount: 1999,
        currency: 'USD',
        status: 'paid',
        transactionId: 'txn_001',
        createdAt: '2025-06-01T00:00:00.000Z',
      },
    ] satisfies BillingPaymentHistoryItem[];
  },
  async fetchSubscriptionRecord({ id }) {
    await delay(40);
    const [owner, ...rest] = id.split('/');
    return {
      status: 'ok',
      msg: '',
      sub: '',
      name: '',
      data: {
        owner,
        name: rest.join('/'),
        displayName: '创小剧订阅测试',
        plan: '创小剧订阅测试',
        pricing: '创小剧会员订阅',
        user: 'admin',
        state: 'Active',
      },
      data2: null,
      data3: null,
    } satisfies BillingCasdoorSubscriptionResponse;
  },
  async fetchSubscriptions(_args: { owner?: string; user?: string } = {}) {
    await delay(40);
    return {
      status: 'ok',
      msg: '',
      sub: '',
      name: '',
      data: [
        {
          owner: 'qixiaoju',
          name: 'subscription_001',
          displayName: '创小剧订阅测试',
          plan: '创小剧订阅测试',
          pricing: '创小剧会员订阅',
          user: 'admin',
          state: 'Active',
        },
      ],
      data2: null,
      data3: null,
    } satisfies BillingCasdoorSubscriptionsResponse;
  },
  async fetchPurchaseStatus() {
    await delay(40);
    return {
      actionKey: 'credits-1000',
      orderId: 'ord_001',
      paymentId: 'pay_001',
      transactionId: 'txn_001',
      status: 'paid',
      orderStatus: 'paid',
      paymentStatus: 'paid',
      transactionStatus: 'linked',
      updatedAt: '2025-06-01T00:00:00.000Z',
    } satisfies BillingPurchaseStatus;
  },
  async fetchCredits() {
    await delay(40);
    return {
      balance: 1000,
      used: 120,
      reserved: 0,
      unit: 'credits',
      updatedAt: '2025-06-01T00:00:00.000Z',
    } satisfies BillingCreditsState;
  },
  async fetchEntitlements() {
    await delay(40);
    return {
      features: ['pro-features', 'avatar-pack'],
      limits: { credits: 1000 },
      flags: { subscribed: true, hasCredits: true },
    } satisfies BillingEntitlementState;
  },
  async fetchProduct({ id }) {
    await delay(60);
    const [owner, ...rest] = id.split('/');
    return {
      status: 'ok',
      msg: '',
      sub: '',
      name: '',
      data: {
        owner,
        name: rest.join('/'),
        displayName: '创小剧积分包-50',
        description: 'Mock Casdoor product detail for purchase flow',
        providers: ['创建小剧-微信支付'],
        providerObjs: [
          {
            name: '创建小剧-微信支付',
            owner: 'qixiaoju',
            title: 'WeChat Pay',
          },
        ],
        returnUrl: '/auth/payment/finished',
        successUrl: '/auth/payment/success',
        price: 50,
        currency: 'CNY',
        quantity: 1,
        isRecharge: true,
        state: 'Published',
      },
      data2: null,
      data3: null,
    } satisfies BillingCasdoorProductResponse;
  },
  async fetchOrganizationNames({ owner }) {
    await delay(40);
    return {
      status: 'ok',
      msg: '',
      sub: '',
      name: '',
      data: [
        { owner: '', name: owner, displayName: 'Qixiaoju' },
        { owner: '', name: `${owner}-store`, displayName: 'Store' },
      ],
      data2: null,
      data3: null,
    } satisfies BillingCasdoorOrganizationNamesResponse;
  },
  async buyProduct(input: BillingCasdoorBuyProductRequest) {
    await delay(120);
    return {
      status: 'ok',
      msg: 'purchase started',
      name: `${input.id}:payment`,
      sub: `${input.id}:order`,
      data: {
        redirectTo: '/auth/payment/success?paymentOwner=qixiaoju&paymentName=mock-payment',
      },
    } satisfies BillingCasdoorBuyProductResponse;
  },
  async createAction(payload: BillingActionPayload) {
    await delay(120);
    return {
      status: 'succeeded',
      redirectTo: payload.returnTo ?? '/billing/success',
    };
  },
  async refresh() {
    await delay(10);
  },
};
