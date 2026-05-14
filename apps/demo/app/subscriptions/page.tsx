import { demoCommerceCatalog } from '../../lib/demo-commerce';

export default function SubscriptionsPage() {
  return (
    <main style={{ display: 'grid', gap: 16 }}>
      <h2>Subscriptions</h2>
      {demoCommerceCatalog.subscriptions.map((subscription) => (
        <article key={subscription.id} style={{ background: '#fff', borderRadius: 20, padding: 20 }}>
          <strong>{subscription.id}</strong>
          <div>{subscription.status}</div>
        </article>
      ))}
    </main>
  );
}
