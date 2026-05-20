import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildBillingPurchaseRequest,
  filterBillingPurchasableItems,
  normalizeBillingRuntimeConfig,
  resolveBillingPurchasable,
} from '../src/billing/runtime.ts';

const items = [
  {
    key: 'starter-month',
    kind: 'subscription',
    title: 'Starter',
    backendRef: {
      productId: 'prod_starter',
      planId: 'plan_starter_month',
      priceId: 'price_starter_month',
    },
  },
  {
    key: 'credits-1000',
    kind: 'product',
    title: '1000 Credits',
    backendRef: {
      productId: 'prod_credits_1000',
      priceId: 'price_credits_1000',
    },
  },
] as const;

test('billing runtime keeps explicit items when no whitelist is configured', () => {
  const visible = filterBillingPurchasableItems(items as any, undefined);
  assert.equal(visible.length, 2);
});

test('billing runtime filters items by purchasableIds and builds purchase requests', () => {
  const config = normalizeBillingRuntimeConfig({
    catalogKey: 'main',
    items: items as any,
    purchasableIds: ['starter-month', 'prod_credits_1000'],
  });

  const visible = filterBillingPurchasableItems(config.items, config);
  assert.equal(visible.length, 2);
  assert.equal(resolveBillingPurchasable(config, 'starter-month')?.kind, 'subscription');
  assert.equal(resolveBillingPurchasable(config, 'prod_credits_1000')?.kind, 'product');

  const request = buildBillingPurchaseRequest(
    {
      kind: 'purchase',
      key: 'credits-1000',
      productId: 'prod_credits_1000',
      quantity: 2,
      returnTo: '/pricing',
    },
    config,
  );

  assert.equal(request?.kind, 'product');
  assert.equal(request?.key, 'credits-1000');
  assert.equal(request?.productId, 'prod_credits_1000');
  assert.equal(request?.productOwner, undefined);
  assert.equal(request?.productName, undefined);
  assert.equal(request?.quantity, 2);
  assert.equal(request?.returnTo, '/pricing');
});

test('billing runtime extracts Casdoor product owner and name from productId', () => {
  const config = normalizeBillingRuntimeConfig({
    catalogKey: 'main',
    items: [
      {
        key: 'credits-50',
        kind: 'product',
        title: '50 Credits',
        backendRef: {
          productId: 'qixiaoju/创小剧积分包-50',
          priceId: 'price_credits_50',
        },
      },
    ] as any,
  });

  const request = buildBillingPurchaseRequest(
    {
      kind: 'purchase',
      key: 'credits-50',
      productId: 'qixiaoju/创小剧积分包-50',
    },
    config,
  );

  assert.equal(request?.productOwner, 'qixiaoju');
  assert.equal(request?.productName, '创小剧积分包-50');
});
