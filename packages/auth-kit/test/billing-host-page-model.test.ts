import assert from 'node:assert/strict';
import test from 'node:test';

import type {
  BillingCasdoorAccountResponse,
  BillingCasdoorApplicationResponse,
  BillingCasdoorPaymentResponse,
} from '../src/billing/types.ts';

test('billing casdoor response models keep account application and payment separated', () => {
  const accountResponse = {
    status: 'ok',
    msg: '',
    sub: 'sub-account',
    name: 'admin',
    data: {
      owner: 'built-in',
      name: 'admin',
      displayName: 'Admin',
      email: 'admin@example.com',
      roles: ['staff'],
      multiFactorAuths: [
        {
          enabled: false,
          isPreferred: false,
          mfaType: 'sms',
          mfaRememberInHours: 0,
        },
      ],
    },
    data2: null,
    data3: null,
  } satisfies BillingCasdoorAccountResponse;

  const applicationResponse = {
    status: 'ok',
    msg: '',
    sub: '',
    name: '',
    data: {
      owner: 'admin',
      name: 'qixiaoju',
      displayName: '企小剧',
      clientId: 'client-123',
      clientSecret: 'secret-123',
      redirectUris: ['https://example.com/callback'],
      providers: [
        {
          name: 'provider_captcha_default',
          provider: {
            owner: 'admin',
            name: 'provider_captcha_default',
            displayName: 'Captcha Default',
            category: 'Captcha',
            type: 'Default',
          },
        },
      ],
      signinMethods: [
        {
          name: 'Password',
          displayName: 'Password',
          rule: 'All',
        },
      ],
      signupItems: [
        {
          name: 'Username',
          visible: true,
          required: true,
          rule: 'None',
        },
      ],
      signinItems: [
        {
          name: 'Login button',
          visible: true,
          rule: 'None',
        },
      ],
      grantTypes: ['authorization_code'],
      organizationObj: {
        owner: 'admin',
        name: 'qixiaoju',
        displayName: '企小剧',
      },
    },
    data2: null,
    data3: null,
  } satisfies BillingCasdoorApplicationResponse;

  const paymentResponse = {
    status: 'ok',
    msg: '',
    sub: '',
    name: '',
    data: {
      owner: 'qixiaoju',
      name: 'payment_20260520_142003_6eae235',
      provider: '创小剧-微信支付',
      productName: '创小剧积分包-1',
      productDisplayName: '创小剧积分包-1',
      currency: 'CNY',
      price: 0.01,
      outOrderId: 'payment_20260520_142003_6eae235',
      payUrl: 'weixin://wxpay/bizpayurl?pr=L23VNTnz3',
      successUrl: 'https://auth.heyaai.com/payments/qixiaoju/payment_20260520_142003_6eae235/result',
      state: 'Paid',
    },
    data2: null,
    data3: null,
  } satisfies BillingCasdoorPaymentResponse;

  assert.equal(accountResponse.data.displayName, 'Admin');
  assert.equal(applicationResponse.data.providers?.[0]?.provider?.displayName, 'Captcha Default');
  assert.equal(paymentResponse.data.state, 'Paid');
});
