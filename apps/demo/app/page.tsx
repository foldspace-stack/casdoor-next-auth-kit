import Link from 'next/link';

const linkStyle = {
  display: 'inline-block',
  padding: '12px 18px',
  borderRadius: '999px',
  background: '#111827',
  color: '#fff',
  textDecoration: 'none',
  marginRight: '12px',
  marginTop: '12px'
} as const;

export default function Page() {
  return (
    <main>
      <section style={{ padding: '32px 0 48px' }}>
        <p style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 12, color: '#92400e' }}>Foldspace demo</p>
        <h1 style={{ fontSize: 56, lineHeight: 1.03, margin: '12px 0 16px' }}>Casdoor next-auth-kit scaffold</h1>
        <p style={{ maxWidth: 680, fontSize: 18, lineHeight: 1.7, color: '#4b5563' }}>
          This demo validates auth, callback, logout, session and headless commerce proxy wiring.
        </p>
        <div style={{ marginTop: 24 }}>
          <Link href="/auth/login" style={linkStyle}>Login</Link>
          <Link href="/auth/signup" style={linkStyle}>Signup</Link>
          <Link href="/me" style={linkStyle}>Protected page</Link>
        </div>
      </section>
      <section style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <Card title="Products" href="/products" />
        <Card title="Subscriptions" href="/subscriptions" />
        <Card title="Orders" href="/orders" />
      </section>
    </main>
  );
}

function Card({ title, href }: { title: string; href: string }) {
  return (
    <Link href={href} style={{ display: 'block', padding: 20, borderRadius: 24, background: '#fff', color: '#111827', textDecoration: 'none', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
      <div style={{ marginTop: 8, color: '#6b7280' }}>Open the smoke-test page</div>
    </Link>
  );
}
