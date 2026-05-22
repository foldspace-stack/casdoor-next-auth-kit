import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildCasdoorQrCodeUrl,
  createCasdoorProductCheckoutSession,
  fetchCasdoorPayment,
  isCasdoorPaidState,
  notifyCasdoorPayment,
} from '../src/billing/casdoor-payment-session.ts';

function toUrl(input: RequestInfo | URL): URL {
  if (input instanceof URL) {
    return input;
  }

  return new URL(String(input));
}

test('creates a QR payment session from buy-product data.payUrl', async () => {
  const previousServerUrl = process.env.NEXT_PUBLIC_CASDOOR_SERVER_URL;
  process.env.NEXT_PUBLIC_CASDOOR_SERVER_URL = 'https://auth.heyaai.com';

  const calls: Array<{ url: URL; init?: RequestInit }> = [];
  const fetchMock: typeof fetch = async (input, init) => {
    const url = toUrl(input);
    calls.push({ url, init });

    if (calls.length === 1) {
      assert.equal(url.pathname, '/auth/api/get-product');
      assert.equal(url.searchParams.get('id'), 'qixiaoju/product_h24p63');
      return new Response(
        JSON.stringify({
          status: 'ok',
          msg: '',
          sub: '',
          name: '',
          data: {
            owner: 'qixiaoju',
            name: 'product_h24p63',
            displayName: 'Product for Plan',
            providers: [],
            providerObjs: [{ name: '创小剧-微信支付', type: 'WeChat Pay' }],
          },
          data2: null,
          data3: null,
        }),
      );
    }

    assert.equal(url.pathname, '/auth/api/buy-product');
    assert.equal(init?.method, 'POST');
    assert.equal(url.searchParams.get('id'), 'qixiaoju/product_h24p63');
    assert.equal(url.searchParams.get('providerName'), '创小剧-微信支付');
    return new Response(
      JSON.stringify({
        status: 'ok',
        msg: '',
        sub: '',
        name: '',
        data: {
          owner: 'qixiaoju',
          name: 'payment_20260522_001416_f71e8f3',
          provider: '创小剧-微信支付',
          payUrl: 'weixin://wxpay/bizpayurl?pr=K1m5pOSz3',
          successUrl: 'https://auth.heyaai.com/payments/qixiaoju/payment_20260522_001416_f71e8f3/result',
          state: 'Created',
        },
        data2: null,
        data3: null,
      }),
    );
  };

  try {
    const session = await createCasdoorProductCheckoutSession({
      requestUrl: 'http://localhost:5177/user/membership',
      cookieHeader: 'casdoor_session_id=session',
      accessToken: 'access-token',
      productId: 'qixiaoju/product_h24p63',
      provider: 'wechat',
      orderRef: 'order-1',
      returnUrl: '/auth/payment/success',
      fetcher: fetchMock,
    });

    assert.equal(session.providerName, '创小剧-微信支付');
    assert.equal(session.paymentSessionId, 'payment_20260522_001416_f71e8f3');
    assert.equal(
      session.checkoutUrl,
      'https://auth.heyaai.com/qrcode/qixiaoju/payment_20260522_001416_f71e8f3?providerName=%E5%88%9B%E5%B0%8F%E5%89%A7-%E5%BE%AE%E4%BF%A1%E6%94%AF%E4%BB%98&successUrl=http%3A%2F%2Flocalhost%3A5177%2Fauth%2Fpayment%2Fsuccess%3ForderId%3Dorder-1&payUrl=weixin%3A%2F%2Fwxpay%2Fbizpayurl%3Fpr%3DK1m5pOSz3',
    );
    assert.equal(
      session.qrCodeUrl,
      'https://api.qrserver.com/v1/create-qr-code/?size=480x480&data=weixin%3A%2F%2Fwxpay%2Fbizpayurl%3Fpr%3DK1m5pOSz3',
    );
    assert.equal(session.successUrl, 'http://localhost:5177/auth/payment/success?orderId=order-1');
    assert.equal((session.raw as { data?: { name?: string } }).data?.name, 'payment_20260522_001416_f71e8f3');
  } finally {
    process.env.NEXT_PUBLIC_CASDOOR_SERVER_URL = previousServerUrl;
  }
});

test('normalizes QR code URLs', () => {
  assert.equal(
    buildCasdoorQrCodeUrl('weixin://wxpay/bizpayurl?pr=abc'),
    'https://api.qrserver.com/v1/create-qr-code/?size=480x480&data=weixin%3A%2F%2Fwxpay%2Fbizpayurl%3Fpr%3Dabc',
  );
});

test('fetches and notifies Casdoor payment records', async () => {
  const calls: Array<URL> = [];
  const fetchMock: typeof fetch = async (input, init) => {
    const url = toUrl(input);
    calls.push(url);

    if (calls.length === 1) {
      assert.equal(url.pathname, '/auth/api/get-payment');
      assert.equal(url.searchParams.get('id'), 'qixiaoju/payment_1');
      assert.equal(init?.method, 'GET');
      return new Response(
        JSON.stringify({
          status: 'ok',
          msg: '',
          sub: '',
          name: '',
          data: { owner: 'qixiaoju', name: 'payment_1', state: 'Created' },
          data2: null,
          data3: null,
        }),
      );
    }

    assert.equal(url.pathname, '/auth/api/notify-payment/qixiaoju/payment_1');
    assert.equal(init?.method, 'POST');
    return new Response(
      JSON.stringify({
        status: 'ok',
        msg: '',
        sub: '',
        name: '',
        data: { owner: 'qixiaoju', name: 'payment_1', state: 'Paid' },
        data2: null,
        data3: null,
      }),
    );
  };

  const payment = await fetchCasdoorPayment({
    requestUrl: 'http://localhost:5177/user/points',
    cookieHeader: 'casdoor_session_id=session',
    accessToken: 'access-token',
    paymentOwner: 'qixiaoju',
    paymentId: 'payment_1',
    fetcher: fetchMock,
  });

  const notified = await notifyCasdoorPayment({
    requestUrl: 'http://localhost:5177/user/points',
    cookieHeader: 'casdoor_session_id=session',
    accessToken: 'access-token',
    paymentOwner: 'qixiaoju',
    paymentId: 'payment_1',
    fetcher: fetchMock,
  });

  assert.equal(payment?.state, 'Created');
  assert.equal(notified?.state, 'Paid');
  assert.equal(isCasdoorPaidState(notified?.state), true);
});
