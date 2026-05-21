import {
  buildBillingSubscriptionCatalog,
  type BillingCatalogConfig,
} from '@foldspace-fe/casdoor-next-auth-kit/billing';

const membershipPlans = [
  {
    id: 'plan-basic',
    code: 'membership-monthly',
    name: 'Membership Monthly',
    level: 'BASIC',
    priceCents: 99900,
    giftPoints: 10000,
    billingCycle: 'MONTH',
    benefits: {
      faceLibrary: true,
      monthlyReports: true,
    },
  },
];

const subscriptionCatalog = buildBillingSubscriptionCatalog(membershipPlans, {
  catalogKey: 'main',
  title: 'Billing Catalog',
  description: 'SaaS plans, credits, and virtual goods',
  defaults: {
    defaultQuantity: 1,
    defaultInterval: 'month',
    defaultReturnTo: '/pricing',
  },
  mapPlan: (plan) => ({
    source: plan,
    key: plan.code,
    title: plan.name,
    description: `${plan.level} membership`,
    productId: 'qixiaoju/创小剧会员订阅',
    planId: plan.id,
    priceId: `pricing_${plan.code}`,
    interval: plan.billingCycle === 'YEAR' ? 'year' : 'month',
    priceValue: plan.priceCents,
    features: Object.entries(plan.benefits)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([feature]) => feature),
    metadata: {
      level: plan.level,
      giftPoints: String(plan.giftPoints),
      billingCycle: plan.billingCycle,
    },
  }),
});

export const billingCatalogExample: BillingCatalogConfig = {
  ...subscriptionCatalog,
  purchasableIds: [...subscriptionCatalog.purchasableIds, 'credits-50'],
  items: [
    ...subscriptionCatalog.items,
    {
      key: 'credits-50',
      kind: 'product',
      title: '50 Credits',
      description: 'One-time product used for credits or other non-recurring goods.',
      credits: 50,
      backendRef: {
        productId: 'qixiaoju/创小剧积分包-50',
        priceId: 'price_credits_50',
      },
      creditGrant: {
        creditsPerUnit: 50,
        unitName: 'credits',
      },
    },
  ],
};
