import assert from 'node:assert/strict';
import test from 'node:test';

import { buildBillingPaymentCallbackContext } from '../src/billing/runtime.ts';

test('payment success callback context passes owner/name and success status', async () => {
  const request = new Request(
    'https://example.com/auth/payment/success?paymentOwner=owner-a&paymentName=starter&paymentId=pay_1&orderId=ord_1&redirect=/done',
  );

  const context = await buildBillingPaymentCallbackContext(request, 'success');
  assert.equal(context.paymentOwner, 'owner-a');
  assert.equal(context.paymentName, 'starter');
  assert.equal(context.paymentId, 'pay_1');
  assert.equal(context.orderId, 'ord_1');
  assert.equal(context.status, 'success');
});

test('payment finished callback context reports finished status', async () => {
  const request = new Request(
    'https://example.com/auth/payment/finished?paymentOwner=owner-b&paymentName=credits&paymentId=pay_2&orderId=ord_2',
  );

  const context = await buildBillingPaymentCallbackContext(request, 'finished');
  assert.equal(context.paymentOwner, 'owner-b');
  assert.equal(context.paymentName, 'credits');
  assert.equal(context.paymentId, 'pay_2');
  assert.equal(context.orderId, 'ord_2');
  assert.equal(context.status, 'finished');
});
