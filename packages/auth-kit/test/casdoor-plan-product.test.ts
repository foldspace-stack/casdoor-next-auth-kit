import assert from 'node:assert/strict';
import test from 'node:test';

import {
  fetchCasdoorPlan,
  fetchCasdoorPricing,
  resolveCasdoorPlanProduct,
  resolveCasdoorPlanProductId,
} from '../src/billing/casdoor-plan-product.ts';

function toUrl(input: RequestInfo | URL): URL {
  if (input instanceof URL) {
    return input;
  }

  return new URL(String(input));
}

test('reads pricing and plan records', async () => {
  const calls: Array<URL> = [];
  const fetchMock: typeof fetch = async (input, init) => {
    const url = toUrl(input);
    calls.push(url);

    if (calls.length === 1) {
      assert.equal(url.pathname, '/auth/api/get-pricing');
      assert.equal(url.searchParams.get('id'), 'qixiaoju/创小剧会员订阅');
      assert.equal(init?.method, 'GET');
      return new Response(
        JSON.stringify({
          status: 'ok',
          msg: '',
          sub: '',
          name: '',
          data: {
            owner: 'qixiaoju',
            name: '创小剧会员订阅',
            plans: ['创小剧 高级会员 4999', '创小剧 基础会员 999'],
            isEnabled: true,
          },
          data2: null,
          data3: null,
        }),
      );
    }

    assert.equal(url.pathname, '/auth/api/get-plan');
    assert.equal(url.searchParams.get('id'), 'qixiaoju/创小剧 高级会员 4999');
    assert.equal(url.searchParams.get('includeOption'), 'true');
    return new Response(
      JSON.stringify({
        status: 'ok',
        msg: '',
        sub: '',
        name: '',
        data: {
          owner: 'qixiaoju',
          name: '创小剧 高级会员 4999',
          product: 'product_hpdu93',
          period: 'Monthly',
          paymentProviders: ['创小剧-微信支付'],
        },
        data2: null,
        data3: null,
      }),
    );
  };

  const pricing = await fetchCasdoorPricing({
    requestUrl: 'http://localhost:5177/user/membership',
    cookieHeader: 'casdoor_session_id=session',
    accessToken: 'access-token',
    owner: 'qixiaoju',
    pricingName: '创小剧会员订阅',
    fetcher: fetchMock,
  });
  const plan = await fetchCasdoorPlan({
    requestUrl: 'http://localhost:5177/user/membership',
    cookieHeader: 'casdoor_session_id=session',
    accessToken: 'access-token',
    owner: 'qixiaoju',
    planName: '创小剧 高级会员 4999',
    fetcher: fetchMock,
  });
  const resolved = await resolveCasdoorPlanProduct({
    requestUrl: 'http://localhost:5177/user/membership',
    cookieHeader: 'casdoor_session_id=session',
    accessToken: 'access-token',
    owner: 'qixiaoju',
    planName: '创小剧 高级会员 4999',
    fetcher: fetchMock,
  });

  assert.deepEqual(pricing.plans, ['创小剧 高级会员 4999', '创小剧 基础会员 999']);
  assert.equal(plan.product, 'product_hpdu93');
  assert.equal(resolved.productId, 'qixiaoju/product_hpdu93');
});

test('resolves owner/product from plan.product', async () => {
  const fetchMock: typeof fetch = async (input) => {
    const url = toUrl(input);
    assert.equal(url.pathname, '/auth/api/get-plan');
    return new Response(
      JSON.stringify({
        status: 'ok',
        msg: '',
        sub: '',
        name: '',
        data: {
          owner: 'qixiaoju',
          name: '创小剧 基础会员 999',
          product: 'product_h24p63',
          period: 'Monthly',
        },
        data2: null,
        data3: null,
      }),
    );
  };

  const productId = await resolveCasdoorPlanProductId({
    requestUrl: 'http://localhost:5177/user/membership',
    cookieHeader: 'casdoor_session_id=session',
    accessToken: 'access-token',
    owner: 'qixiaoju',
    planName: '创小剧 基础会员 999',
    fetcher: fetchMock,
  });

  assert.equal(productId, 'qixiaoju/product_h24p63');
});

test('throws when the plan has no product', async () => {
  const fetchMock: typeof fetch = async (input) => {
    const url = toUrl(input);
    assert.equal(url.pathname, '/auth/api/get-plan');
    return new Response(
      JSON.stringify({
        status: 'ok',
        msg: '',
        sub: '',
        name: '',
        data: {
          owner: 'qixiaoju',
          name: '创小剧 基础会员 999',
        },
        data2: null,
        data3: null,
      }),
    );
  };

  await assert.rejects(
    resolveCasdoorPlanProduct({
      requestUrl: 'http://localhost:5177/user/membership',
      cookieHeader: 'casdoor_session_id=session',
      accessToken: 'access-token',
      owner: 'qixiaoju',
      planName: '创小剧 基础会员 999',
      fetcher: fetchMock,
    }),
    /did not return a product/,
  );
});
