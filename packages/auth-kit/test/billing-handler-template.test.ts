import assert from 'node:assert/strict';
import test from 'node:test';

import {
  billingOrderRedirectTemplate,
  billingPaymentFinishedHandlerTemplate,
  billingPaymentSuccessHandlerTemplate,
} from '../src/cli/templates.ts';

function assertHandlerTemplateKeepsRedirectImport(template: string, handlerName: string) {
  assert.match(
    template,
    /import { resolveBillingOrderRedirect } from '\.\/order-redirect';\n\n\/\/ @foldspace-fe\/casdoor-next-auth-kit:begin custom/,
  );
  assert.match(template, new RegExp(`const ${handlerName}Impl`));
  assert.match(template, /resolveBillingOrderRedirect\(context\.orderId \|\| context\.paymentId\)/);
}

test('billing payment success template re-emits resolveBillingOrderRedirect import', () => {
  assertHandlerTemplateKeepsRedirectImport(
    billingPaymentSuccessHandlerTemplate(),
    'paymentSuccessHandler',
  );
});

test('billing payment finished template re-emits resolveBillingOrderRedirect import', () => {
  assertHandlerTemplateKeepsRedirectImport(
    billingPaymentFinishedHandlerTemplate(),
    'paymentFinishedHandler',
  );
});

test('billing order redirect template stays available for generated handlers', () => {
  assert.match(
    billingOrderRedirectTemplate(),
    /export function resolveBillingOrderRedirect\(orderIdOrPaymentId\?: string \| null\): string \| null/,
  );
});
