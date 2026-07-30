'use client';

import Link from 'next/link';
import { useBillingOrderHistory, useBillingOrders, useBillingPaymentHistory } from '@foldspace-fe/casdoor-next-auth-kit/react';
import { AuthSurface, Badge, Card, CardBody, CardHeader } from '@foldspace-fe/casdoor-next-auth-kit/auth';

export default function OrdersPage() {
  const orders = useBillingOrders();
  const orderHistory = useBillingOrderHistory();
  const payments = useBillingPaymentHistory();

  return (
    <AuthSurface>
      <div style={{ display: 'grid', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 12, color: '#92400e' }}>Billing</p>
            <h1 style={{ margin: '8px 0 0' }}>Orders</h1>
          </div>
          <Link href="/me" style={linkStyle}>
            Back to account
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: 0 }}>Order summary</h2>
                <p style={{ margin: '8px 0 0', color: '#6b7280' }}>Local order and payment state seeded by the demo provider.</p>
              </div>
              <Badge>{payments.payments[0]?.status ?? 'idle'}</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div style={statRow}>
              <span>订单数</span>
              <strong>{orders.data?.length ?? 0}</strong>
            </div>
            <div style={statRow}>
              <span>历史订单</span>
              <strong>{orderHistory.orders.length}</strong>
            </div>
            <div style={statRow}>
              <span>支付记录</span>
              <strong>{payments.payments.length}</strong>
            </div>
          </CardBody>
        </Card>

        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {orderHistory.orders.map((order) => (
            <Card key={order.orderId}>
              <CardHeader>
                <h2 style={{ margin: 0 }}>{order.orderId}</h2>
              </CardHeader>
              <CardBody>
                <div style={statRow}>
                  <span>状态</span>
                  <strong>{order.status ?? 'pending'}</strong>
                </div>
                <div style={statRow}>
                  <span>金额</span>
                  <strong>{order.amount ?? 0}</strong>
                </div>
                <div style={statRow}>
                  <span>商品</span>
                  <strong>{order.productTitle ?? order.productKey ?? 'n/a'}</strong>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </AuthSurface>
  );
}

const linkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 44,
  padding: '0 18px',
  borderRadius: 9999,
  background: '#111827',
  color: '#fff',
  textDecoration: 'none',
} as const;

const statRow = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  padding: '10px 0',
  borderBottom: '1px solid #f1f5f9',
} as const;
