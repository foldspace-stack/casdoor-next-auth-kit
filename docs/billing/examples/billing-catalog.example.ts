import type { BillingCatalogConfig } from '@foldspace-fe/casdoor-next-auth-kit/billing';

export const billingCatalogExample: BillingCatalogConfig = {
  catalogKey: 'main',
  title: 'Billing Catalog',
  description: 'SaaS plans, credits, and virtual goods',
  defaults: {
    defaultQuantity: 1,
    defaultInterval: 'month',
    defaultReturnTo: '/pricing',
  },
  items: [
    {
      key: 'starter-month',
      kind: 'subscription',
      title: 'Starter',
      description: 'For solo users who need the core product.',
      interval: 'month',
      featured: false,
      backendRef: {
        productId: 'prod_starter',
        planId: 'plan_starter_month',
        priceId: 'price_starter_month',
      },
    },
    {
      key: 'pro-year',
      kind: 'subscription',
      title: 'Pro',
      description: 'For teams that want more usage and features.',
      interval: 'year',
      featured: true,
      badge: 'Popular',
      backendRef: {
        productId: 'prod_pro',
        planId: 'plan_pro_year',
        priceId: 'price_pro_year',
      },
    },
    {
      key: 'credits-1000',
      kind: 'credits',
      title: '1000 Credits',
      description: 'Buy credits for usage based actions.',
      credits: 1000,
      backendRef: {
        productId: 'prod_credits_1000',
        priceId: 'price_credits_1000',
      },
      creditGrant: {
        creditsPerUnit: 1000,
        unitName: 'credits',
      },
    },
    {
      key: 'avatar-pack',
      kind: 'product',
      title: 'Avatar Pack',
      description: 'A virtual goods bundle.',
      backendRef: {
        productId: 'prod_avatar_pack',
        priceId: 'price_avatar_pack',
      },
    },
  ],
};
