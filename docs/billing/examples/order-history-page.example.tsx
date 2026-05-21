'use client';

import {
  useBillingOrder,
  useBillingOrders,
  useBillingPurchaseStatus,
  useBillingSubscriptionRecord,
  useBillingSubscriptions,
} from '@foldspace-fe/casdoor-next-auth-kit/react';

export function OrderHistoryPageExample() {
  const orders = useBillingOrders({ owner: 'qixiaoju', user: 'admin' });
  const subscriptions = useBillingSubscriptions({ owner: 'qixiaoju', user: 'admin' });
  const purchaseStatus = useBillingPurchaseStatus();
  const latestOrderId = orders.data?.[0]?.name;
  const latestSubscriptionId = subscriptions.data?.[0]?.name;
  const latestOrder = useBillingOrder(latestOrderId ?? '');
  const latestSubscription = useBillingSubscriptionRecord(latestSubscriptionId ?? '');

  return (
    <section style={{ display: 'grid', gap: 24 }}>
      <header>
        <h2>Order History</h2>
        <p>Latest status: {purchaseStatus.purchaseStatus?.status ?? 'idle'}</p>
      </header>

      <div>
        <h3>Orders</h3>
        <p>Count: {orders.data?.length ?? 0}</p>
        <pre>{JSON.stringify(orders.data ?? [], null, 2)}</pre>
      </div>

      <div>
        <h3>Latest Order Detail</h3>
        <pre>{JSON.stringify(latestOrder.data ?? null, null, 2)}</pre>
      </div>

      <div>
        <h3>Subscriptions</h3>
        <p>Count: {subscriptions.data?.length ?? 0}</p>
        <pre>{JSON.stringify(subscriptions.data ?? [], null, 2)}</pre>
      </div>

      <div>
        <h3>Latest Subscription Detail</h3>
        <pre>{JSON.stringify(latestSubscription.data ?? null, null, 2)}</pre>
      </div>

      <div>
        <h3>Normalized Purchase Status</h3>
        <pre>{JSON.stringify(purchaseStatus.purchaseStatus ?? null, null, 2)}</pre>
      </div>

      <div>
        <h3>Host Ownership</h3>
        <p>Render the list, detail panel, polling logic, and retry buttons in the host UI. The package only supplies data hooks and normalized state.</p>
      </div>
    </section>
  );
}
