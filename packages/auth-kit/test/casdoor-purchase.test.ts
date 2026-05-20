import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildCasdoorBuyProductParams,
  buildCasdoorBuyProductRequest,
  chooseCasdoorProviderName,
  normalizeCasdoorProductId,
} from '../src/billing/casdoor-purchase.ts';

test('casdoor purchase helpers normalize product ids and build buy-product requests', () => {
  const productId = normalizeCasdoorProductId('qixiaoju/创小剧积分包-50');
  assert.equal(productId.owner, 'qixiaoju');
  assert.equal(productId.name, '创小剧积分包-50');

  const product = {
    owner: productId.owner,
    name: productId.name,
    providers: ['创建小剧-微信支付'],
  };

  assert.equal(chooseCasdoorProviderName(product), '创建小剧-微信支付');

  const request = buildCasdoorBuyProductRequest(
    {
      kind: 'product',
      key: 'credits-50',
      productId: 'qixiaoju/创小剧积分包-50',
      providerName: '',
      pricingName: '',
      planName: '',
      userName: 'demo',
      paymentEnv: 'prod',
      customPrice: 50,
    },
    {
      owner: productId.owner,
      name: productId.name,
      providers: ['创建小剧-微信支付'],
    },
  );

  assert.equal(request.id, 'qixiaoju/创小剧积分包-50');
  assert.equal(request.providerName, '创建小剧-微信支付');
  assert.equal(request.userName, 'demo');
  assert.equal(request.customPrice, 50);

  const params = buildCasdoorBuyProductParams(request);
  assert.equal(params.get('id'), 'qixiaoju/创小剧积分包-50');
  assert.equal(params.get('providerName'), '创建小剧-微信支付');
  assert.equal(params.get('customPrice'), '50');
});
