'use client';

import Link from 'next/link';
import { useBillingAvailableProducts } from '@foldspace-fe/casdoor-next-auth-kit/react';
import { AuthSurface, Card, CardBody, CardHeader, Badge } from '@foldspace-fe/casdoor-next-auth-kit/auth';

export default function ProductsPage() {
  const products = useBillingAvailableProducts();

  return (
    <AuthSurface>
      <div style={{ display: 'grid', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 12, color: '#92400e' }}>Billing</p>
            <h1 style={{ margin: '8px 0 0' }}>Products</h1>
          </div>
          <Link href="/me" style={linkStyle}>
            Back to account
          </Link>
        </div>

        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {products.items.map((product) => (
            <Card key={product.key}>
              <CardHeader>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ margin: 0 }}>{product.title}</h2>
                    <p style={{ margin: '8px 0 0', color: '#6b7280' }}>{product.description}</p>
                  </div>
                  <Badge>{product.kind}</Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div style={statRow}>
                  <span>价格</span>
                  <strong>{product.priceLabel ?? '免费'}</strong>
                </div>
                <div style={statRow}>
                  <span>积分</span>
                  <strong>{product.credits ?? 'n/a'}</strong>
                </div>
                <div style={statRow}>
                  <span>商品 ID</span>
                  <strong>{product.backendRef.productId}</strong>
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
