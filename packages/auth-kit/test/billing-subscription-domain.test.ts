import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildBillingActionPayload,
  normalizeBillingRuntimeConfig,
  resolveBillingPurchasable,
} from '../src/billing/runtime.ts';

test('billing subscription catalog keeps subscriptions separate from products', () => {
  const config = normalizeBillingRuntimeConfig({
    catalogKey: 'main',
    items: [
      {
        key: 'membership-yearly',
        kind: 'subscription',
        title: 'Membership Yearly',
        backendRef: {
          productId: 'qixiaoju/创小剧会员订阅',
          planId: 'qixiaoju/创小剧订阅测试',
          priceId: 'pricing_yearly',
        },
      },
      {
        key: 'credits-50',
        kind: 'product',
        title: '50 Credits',
        backendRef: {
          productId: 'qixiaoju/创小剧积分包-50',
          priceId: 'price_credits_50',
        },
      },
    ] as const,
  });

  assert.equal(resolveBillingPurchasable(config, 'membership-yearly')?.kind, 'subscription');
  assert.equal(resolveBillingPurchasable(config, 'credits-50')?.kind, 'product');

  const subscriptionPayload = buildBillingActionPayload(
    {
      kind: 'subscribe',
      key: 'membership-yearly',
      productId: 'qixiaoju/创小剧会员订阅',
      providerName: '创小剧-微信支付',
      pricingName: '创小剧会员订阅',
      planName: '创小剧订阅测试',
    },
    config,
  );

  const productPayload = buildBillingActionPayload(
    {
      kind: 'purchase',
      key: 'credits-50',
      productId: 'qixiaoju/创小剧积分包-50',
      providerName: '创小剧-微信支付',
    },
    config,
  );

  assert.equal(subscriptionPayload?.kind, 'subscribe');
  assert.equal(subscriptionPayload?.subscriptionConfig?.productKey, 'membership-yearly');
  assert.equal(subscriptionPayload?.subscriptionConfig?.planId, 'qixiaoju/创小剧订阅测试');

  assert.equal(productPayload?.kind, 'purchase');
  assert.equal(productPayload?.productConfig?.productKey, 'credits-50');
  assert.equal(productPayload?.productConfig?.productId, 'qixiaoju/创小剧积分包-50');
});
