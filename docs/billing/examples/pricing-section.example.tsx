'use client';

import { useEffect, useState } from 'react';

import {
  useBillingAvailablePlans,
  useBillingAvailableProducts,
  useBillingOrderHistory,
  useBillingPaymentHistory,
  useBillingPurchaseStatus,
  useBillingProductPurchaseOptions,
  useBillingSubscription,
  useBillingSubscriptionHistory,
  usePurchaseProduct,
  useSubscribePlan,
} from '@foldspace-fe/casdoor-next-auth-kit/react';

export function PricingSectionExample() {
  const { plans } = useBillingAvailablePlans();
  const { items } = useBillingAvailableProducts();
  const [selectedProductId, setSelectedProductId] = useState('');
  const productOptions = useBillingProductPurchaseOptions(selectedProductId);
  const selectedItem = items.find((item) => item.backendRef.productId === selectedProductId);
  const { subscription } = useBillingSubscription();
  const { history } = useBillingSubscriptionHistory();
  const { orders } = useBillingOrderHistory();
  const { payments } = useBillingPaymentHistory();
  const { purchaseStatus } = useBillingPurchaseStatus();
  const subscribePlan = useSubscribePlan();
  const purchaseProduct = usePurchaseProduct();

  useEffect(() => {
    if (!selectedProductId && items[0]?.backendRef.productId) {
      setSelectedProductId(items[0].backendRef.productId);
    }
  }, [items, selectedProductId]);

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
          return (
            <button
              key={item.key}
              onClick={() => setSelectedProductId(item.backendRef.productId)}
              disabled={purchaseProduct.loading}
            >
              Buy {item.title}
            </button>
          );
        })}
      </div>

      <div>
        <h3>Selected Product Detail</h3>
        <p>{productOptions.product?.displayName ?? productOptions.product?.name ?? 'No product selected'}</p>
        <p>Selected provider: {productOptions.selectedProvider?.displayName ?? productOptions.selectedProvider?.name ?? 'none'}</p>
        <ul>
          {productOptions.providerObjs.map((provider) => (
            <li key={provider.name}>
              <button
                type="button"
                onClick={() => productOptions.setProviderName(provider.name)}
                aria-pressed={productOptions.providerName === provider.name}
              >
                {provider.displayName ?? provider.name}
                {provider.type ? ` (${provider.type})` : ''}
              </button>
            </li>
          ))}
        </ul>
        <div>
          <h4>Two payment options</h4>
          <div>
            {productOptions.providerObjs.slice(0, 2).map((provider) => (
              <button
                key={provider.name}
                type="button"
                onClick={() => productOptions.setProviderName(provider.name)}
                disabled={purchaseProduct.loading}
              >
                Pay with {provider.displayName ?? provider.name}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!selectedItem) return;
            void purchaseProduct.run({ key: selectedItem.key, providerName: productOptions.providerName });
          }}
          disabled={purchaseProduct.loading || !selectedItem}
        >
          Buy with selected provider
        </button>
      </div>

      <pre>{JSON.stringify({ history, orders, payments, purchaseStatus }, null, 2)}</pre>
    </section>
  );
}
