'use client';

import Link from 'next/link';
import { useAuthUser, useBillingCredits, useBillingOrders, useBillingPurchaseStatus, useBillingSubscription, useBillingSubscriptions } from '@foldspace-fe/casdoor-next-auth-kit/react';
import { AuthAccountDashboard } from '@foldspace-fe/casdoor-next-auth-kit/auth';
import { AuthSurface, Badge, Card, CardBody, CardHeader } from '@foldspace-fe/casdoor-next-auth-kit/auth';

const panelStyle = {
  borderRadius: 24,
  background: '#fff',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
} as const;

export default function MePage() {
  const user = useAuthUser();
  const subscription = useBillingSubscription();
  const subscriptions = useBillingSubscriptions();
  const credits = useBillingCredits();
  const orders = useBillingOrders();
  const purchaseStatus = useBillingPurchaseStatus();

  return (
    <AuthSurface>
      <div style={{ display: 'grid', gap: 24 }}>
        <section style={{ ...panelStyle, padding: 28, display: 'grid', gap: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 12, color: '#92400e' }}>Account center</p>
              <h1 style={{ margin: '10px 0 6px', fontSize: 34, lineHeight: 1.05 }}>Local SaaS dashboard</h1>
              <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.7 }}>
                页面流已经切回当前 Next.js 应用，登录、订阅和积分购买都通过本地路由和本地 provider 组合完成。
              </p>
            </div>
            <Badge>{user.isAuthenticated ? user.role : 'guest'}</Badge>
          </div>

          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <Metric label="角色" value={user.role} />
            <Metric label="订阅状态" value={subscription.subscription?.status ?? 'inactive'} />
            <Metric label="积分余额" value={String(credits.credits?.balance ?? 0)} />
            <Metric label="订单数" value={String(orders.data?.length ?? 0)} />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link href="/auth/login" style={actionLink}>
              登录
            </Link>
            <Link href="/auth/signup" style={actionLinkSecondary}>
              注册
            </Link>
            <Link href="/subscriptions" style={actionLinkSecondary}>
              订阅
            </Link>
            <Link href="/products" style={actionLinkSecondary}>
              积分购买
            </Link>
            <Link href="/orders" style={actionLinkSecondary}>
              订单
            </Link>
          </div>
        </section>

        <section style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <Card style={panelStyle}>
            <CardHeader>
              <h2 style={{ margin: 0 }}>账号状态</h2>
            </CardHeader>
            <CardBody>
              <div style={statRow}>
                <span>用户</span>
                <strong>{user.name}</strong>
              </div>
              <div style={statRow}>
                <span>邮箱</span>
                <strong>{user.email ?? '未登录'}</strong>
              </div>
              <div style={statRow}>
                <span>会员</span>
                <strong>{user.isVip ? '是' : '否'}</strong>
              </div>
              <div style={statRow}>
                <span>管理员</span>
                <strong>{user.isAdmin ? '是' : '否'}</strong>
              </div>
            </CardBody>
          </Card>

          <Card style={panelStyle}>
            <CardHeader>
              <h2 style={{ margin: 0 }}>购买状态</h2>
            </CardHeader>
            <CardBody>
              <div style={statRow}>
                <span>当前状态</span>
                <strong>{purchaseStatus.purchaseStatus?.status ?? 'idle'}</strong>
              </div>
              <div style={statRow}>
                <span>最近订单</span>
                <strong>{purchaseStatus.purchaseStatus?.orderId ?? 'none'}</strong>
              </div>
              <div style={statRow}>
                <span>最近支付</span>
                <strong>{purchaseStatus.purchaseStatus?.paymentId ?? 'none'}</strong>
              </div>
              <div style={statRow}>
                <span>订阅数</span>
                <strong>{subscriptions.data?.length ?? 0}</strong>
              </div>
            </CardBody>
          </Card>
        </section>

        <section style={panelStyle}>
          <AuthAccountDashboard appName="demo-app" organizationName="demo-org" subscriptionPricingId="membership-monthly" productId="credits-50" />
        </section>
      </div>
    </AuthSurface>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '18px 20px', borderRadius: 20, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 13, color: '#6b7280' }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const actionLink = {
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

const actionLinkSecondary = {
  ...actionLink,
  background: '#fff',
  color: '#111827',
  border: '1px solid #d1d5db',
} as const;

const statRow = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  padding: '10px 0',
  borderBottom: '1px solid #f1f5f9',
} as const;
