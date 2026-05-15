'use client';

import {
  useBillingAvailablePlans,
  useBillingAvailableProducts,
  useBillingOrderHistory,
  useBillingPaymentHistory,
  useBillingPurchaseStatus,
  useBillingSubscription,
  useBillingSubscriptionHistory,
  usePurchaseCredits,
  usePurchaseProduct,
  useSubscribePlan,
} from '@foldspace-fe/casdoor-next-auth-kit/react';

export function PricingSectionExample() {
  const { plans } = useBillingAvailablePlans();
  const { items } = useBillingAvailableProducts();
  const { subscription } = useBillingSubscription();
  const { history } = useBillingSubscriptionHistory();
  const { orders } = useBillingOrderHistory();
  const { payments } = useBillingPaymentHistory();
  const { purchaseStatus } = useBillingPurchaseStatus();
  const subscribePlan = useSubscribePlan();
  const purchaseCredits = usePurchaseCredits();
  const purchaseProduct = usePurchaseProduct();

  return (
    <section>
      <header>
        <h2>Billing</h2>
        <p>Current subscription: {subscription?.planName ?? 'none'}</p>
      </header>

      <div>
        <h3>Plans</h3>
        {plans.map((plan) => (
          <button key={plan.key} onClick={() => subscribePlan.run({ key: plan.key })} disabled={subscribePlan.loading}>
            Subscribe {plan.title}
          </button>
        ))}
      </div>

      <div>
        <h3>Products</h3>
        {items.map((item) => {
          const run = item.kind === 'credits' ? purchaseCredits : purchaseProduct;
          return (
            <button key={item.key} onClick={() => run.run({ key: item.key })} disabled={run.loading}>
              Buy {item.title}
            </button>
          );
        })}
      </div>

      <pre>{JSON.stringify({ history, orders, payments, purchaseStatus }, null, 2)}</pre>
    </section>
  );
}
