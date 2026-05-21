import type { BillingCatalogConfig } from '@foldspace-fe/casdoor-next-auth-kit/billing';

export const billingCatalogExample: BillingCatalogConfig = {
  catalogKey: 'main',
  title: 'Billing Catalog',
  description: 'SaaS plans, credits, and virtual goods',
  purchasableIds: ['membership-monthly', 'credits-50'],
  defaults: {
    defaultQuantity: 1,
    defaultInterval: 'month',
    defaultReturnTo: '/pricing',
  },
  items: [
    {
      key: 'membership-monthly',
      kind: 'subscription',
      title: 'Membership Monthly',
      description: 'Monthly membership plan driven by a Casdoor pricing and plan pair.',
      interval: 'month',
      featured: false,
      backendRef: {
        productId: 'qixiaoju/创小剧会员订阅',
        planId: 'qixiaoju/创小剧订阅测试',
        priceId: 'pricing_membership_monthly',
      },
    },
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
