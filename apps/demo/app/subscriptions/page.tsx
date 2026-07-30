'use client';

import Link from 'next/link';
import { useBillingAvailablePlans, useBillingSubscription, useBillingSubscriptionHistory, useBillingSubscriptions } from '@foldspace-fe/casdoor-next-auth-kit/react';
import { AuthSurface, Badge, Card, CardBody, CardHeader } from '@foldspace-fe/casdoor-next-auth-kit/auth';

export default function SubscriptionsPage() {
  const plans = useBillingAvailablePlans();
  const subscription = useBillingSubscription();
  const history = useBillingSubscriptionHistory();
  const subscriptions = useBillingSubscriptions();

  return (
    <AuthSurface>
      <div style={{ display: 'grid', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 12, color: '#92400e' }}>Billing</p>
            <h1 style={{ margin: '8px 0 0' }}>Subscriptions</h1>
          </div>
          <Link href="/me" style={linkStyle}>
            Back to account
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: 0 }}>Active subscription</h2>
                <p style={{ margin: '8px 0 0', color: '#6b7280' }}>{subscription.subscription?.planName ?? 'No active subscription'}</p>
              </div>
              <Badge>{subscription.subscription?.status ?? 'inactive'}</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div style={statRow}>
              <span>总订阅数</span>
              <strong>{subscriptions.data?.length ?? 0}</strong>
            </div>
            <div style={statRow}>
              <span>历史记录</span>
              <strong>{history.history.length}</strong>
            </div>
            <div style={statRow}>
              <span>可订阅套餐</span>
              <strong>{plans.plans.length}</strong>
            </div>
          </CardBody>
        </Card>

        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {plans.plans.map((plan) => (
            <Card key={plan.key}>
              <CardHeader>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ margin: 0 }}>{plan.title}</h2>
                    <p style={{ margin: '8px 0 0', color: '#6b7280' }}>{plan.description}</p>
                  </div>
                  <Badge>{plan.interval ?? 'month'}</Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div style={statRow}>
                  <span>价格</span>
                  <strong>{plan.priceLabel ?? 'n/a'}</strong>
                </div>
                <div style={statRow}>
                  <span>计划 ID</span>
                  <strong>{plan.backendRef.planId ?? plan.backendRef.productId}</strong>
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
