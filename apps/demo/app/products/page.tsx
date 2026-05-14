import { demoCommerceCatalog } from '../../lib/demo-commerce';

export default function ProductsPage() {
  return (
    <main style={{ display: 'grid', gap: 16 }}>
      <h2>Products</h2>
      {demoCommerceCatalog.products.map((product) => (
        <article key={product.id} style={{ background: '#fff', borderRadius: 20, padding: 20 }}>
          <strong>{product.name}</strong>
          <div>{product.price}</div>
        </article>
      ))}
    </main>
  );
}
