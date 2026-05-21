import assert from 'node:assert/strict';
import test from 'node:test';

import { buildBillingSubscriptionCatalog } from '../src/billing/subscription-catalog.ts';

test('buildBillingSubscriptionCatalog maps host plans to subscription catalog items', () => {
  const catalog = buildBillingSubscriptionCatalog(
    [
      {
        id: 'plan-basic',
        code: 'basic-yearly',
        name: '基础会员',
        level: 'BASIC',
        priceCents: 99900,
        giftPoints: 10000,
        billingCycle: 'YEAR',
        benefits: {
          faceLibrary: true,
        },
      },
    ],
    {
      catalogKey: 'membership',
      title: 'Membership',
      description: 'Subscription catalog bridge',
      mapPlan: (plan) => ({
        source: plan,
        key: plan.code,
        title: plan.name,
        description: plan.level,
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
    },
  );

  assert.equal(catalog.items.length, 1);
  assert.equal(catalog.items[0].kind, 'subscription');
  assert.equal(catalog.items[0].key, 'basic-yearly');
  assert.equal(catalog.items[0].backendRef.planId, 'plan-basic');
  assert.equal(catalog.items[0].backendRef.productId, 'qixiaoju/创小剧会员订阅');
  assert.equal(catalog.items[0].metadata?.giftPoints, '10000');
});
