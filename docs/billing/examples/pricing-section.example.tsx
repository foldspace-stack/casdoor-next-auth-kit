'use client';

import { useMemo } from 'react';

import {
  useBillingOrders,
  useBillingPricingPlans,
  useBillingProductPurchaseOptions,
  useBillingPurchaseStatus,
  useBillingSubscriptionPurchaseOptions,
  useBillingSubscriptions,
  usePurchaseProduct,
  useSubscribePlan,
} from '@foldspace-fe/casdoor-next-auth-kit/react';

export function PricingSectionExample() {
  const pricingId = 'qixiaoju/创小剧会员订阅';
  const productId = 'qixiaoju/创小剧积分包-50';

  const subscriptionOptions = useBillingSubscriptionPurchaseOptions(pricingId);
  const pricingPlans = useBillingPricingPlans(pricingId, false, subscriptionOptions.selectedPlanName);
  const productOptions = useBillingProductPurchaseOptions(productId);
  const orders = useBillingOrders({ owner: 'qixiaoju', user: 'admin' });
  const subscriptions = useBillingSubscriptions({ owner: 'qixiaoju', user: 'admin' });
  const { purchaseStatus } = useBillingPurchaseStatus();
  const subscribePlan = useSubscribePlan();
  const purchaseProduct = usePurchaseProduct();

  const selectedPlanName = useMemo(
    () => subscriptionOptions.selectedPlanName ?? subscriptionOptions.plans[0]?.name,
    [subscriptionOptions.plans, subscriptionOptions.selectedPlanName],
  );

  return (
    <section style={{ display: 'grid', gap: 24 }}>
      <header>
        <h2>Host-owned Billing Panel</h2>
        <p>Package only supplies headless hooks and normalized query state.</p>
      </header>

      <div>
        <h3>Subscription Purchase</h3>
        <p>Pricing: {subscriptionOptions.pricing?.displayName ?? pricingId}</p>
        <p>Selected plan: {subscriptionOptions.selectedPlan?.displayName ?? selectedPlanName ?? 'none'}</p>
        <p>Plan count: {pricingPlans.length}</p>
        <div>
          {subscriptionOptions.plans.map((plan) => (
            <button
              key={plan.name}
              type="button"
              onClick={() => subscriptionOptions.setSelectedPlanName(plan.name)}
              aria-pressed={subscriptionOptions.selectedPlanName === plan.name}
            >
              {plan.displayName ?? plan.name}
              {plan.period ? ` (${plan.period})` : ''}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            if (!selectedPlanName) return;
            void subscribePlan.run({
              key: selectedPlanName,
              planName: selectedPlanName,
              pricingName: subscriptionOptions.pricing?.name,
            });
          }}
          disabled={subscribePlan.loading || !selectedPlanName}
        >
          Subscribe with selected plan
        </button>
      </div>

      <div>
        <h3>Product Purchase</h3>
        <p>Product: {productOptions.product?.displayName ?? productId}</p>
        <p>Selected provider: {productOptions.selectedProvider?.displayName ?? productOptions.selectedProvider?.name ?? 'none'}</p>
        <div>
          {productOptions.providerObjs.map((provider) => (
            <button
              key={provider.name}
              type="button"
              onClick={() => productOptions.setProviderName(provider.name)}
              aria-pressed={productOptions.providerName === provider.name}
            >
              {provider.displayName ?? provider.name}
              {provider.type ? ` (${provider.type})` : ''}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            if (!productOptions.product) return;
            void purchaseProduct.run({
              key: productOptions.product.name,
              productId,
              providerName: productOptions.providerName,
            });
          }}
          disabled={purchaseProduct.loading || !productOptions.product}
        >
          Buy with selected provider
        </button>
      </div>

      <div>
        <h3>Casdoor Queries</h3>
        <p>Subscriptions: {subscriptions.data?.length ?? 0}</p>
        <p>Orders: {orders.data?.length ?? 0}</p>
        <p>Latest order: {orders.data?.[0]?.productDisplayName ?? orders.data?.[0]?.name ?? 'none'}</p>
        <p>Purchase status: {purchaseStatus?.status ?? 'idle'}</p>
      </div>

      <div>
        <h3>Subscription Results</h3>
        <pre>{JSON.stringify(subscriptions.data ?? [], null, 2)}</pre>
      </div>

      <div>
        <h3>Order Results</h3>
        <pre>{JSON.stringify(orders.data ?? [], null, 2)}</pre>
      </div>

      <div>
        <h3>Subscription Purchase Options</h3>
        <pre>
          {JSON.stringify(
            {
              pricing: subscriptionOptions.pricing,
              plans: pricingPlans,
              selectedPlanName: subscriptionOptions.selectedPlanName,
              selectedPlan: subscriptionOptions.selectedPlan,
            },
            null,
            2,
          )}
        </pre>
      </div>

      <div>
        <h3>Product Purchase Options</h3>
        <pre>
          {JSON.stringify(
            {
              product: productOptions.product,
              providerName: productOptions.providerName,
              selectedProvider: productOptions.selectedProvider,
              providers: productOptions.providers,
            },
            null,
            2,
          )}
        </pre>
      </div>

      <div>
        <h3>Host Ownership</h3>
        <p>QR code display, order panels, and success/failure UX should be rendered by the host in its own page tree.</p>
      </div>
    </section>
  );
}
