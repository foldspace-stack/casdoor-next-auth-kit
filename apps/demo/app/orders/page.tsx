import { demoCommerceCatalog } from '../../lib/demo-commerce';

export default function OrdersPage() {
  return (
    <main style={{ display: 'grid', gap: 16 }}>
      <h2>Orders</h2>
      {demoCommerceCatalog.orders.map((order) => (
        <article key={order.id} style={{ background: '#fff', borderRadius: 20, padding: 20 }}>
          <strong>{order.id}</strong>
          <div>{order.status}</div>
        </article>
      ))}
    </main>
  );
}
