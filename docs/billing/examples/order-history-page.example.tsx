'use client';

import {
  useBillingOrderHistory,
  useBillingPaymentHistory,
  useBillingSubscriptionHistory,
  useBillingPurchaseStatus,
} from '@foldspace/casdoor-next-auth-kit/react';

export function OrderHistoryPageExample() {
  const { orders } = useBillingOrderHistory();
  const { payments } = useBillingPaymentHistory();
  const { history } = useBillingSubscriptionHistory();
  const { purchaseStatus } = useBillingPurchaseStatus();

  return (
    <section>
      <header>
        <h2>Order History</h2>
        <p>Latest status: {purchaseStatus?.status ?? 'idle'}</p>
      </header>

      <div>
        <h3>Orders</h3>
        <ul>
          {orders.map((order) => (
            <li key={order.orderId}>
              {order.productTitle ?? order.productKey} - {order.status}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Payments</h3>
        <ul>
          {payments.map((payment) => (
            <li key={payment.paymentId}>
              {payment.paymentId} - {payment.status}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Subscriptions</h3>
        <ul>
          {history.map((item) => (
            <li key={item.subscriptionId}>
              {item.planName ?? item.planKey} - {item.status}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
