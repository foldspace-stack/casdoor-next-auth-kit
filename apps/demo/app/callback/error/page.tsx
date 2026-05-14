export default async function CallbackErrorPage({ searchParams }: { searchParams: Promise<{ title?: string; message?: string; details?: string }> }) {
  const params = await searchParams;
  return (
    <main style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}>
      <h2 style={{ marginTop: 0 }}>{params.title ?? 'Callback Error'}</h2>
      <p>{params.message ?? 'Unknown callback failure.'}</p>
      {params.details ? <pre style={{ whiteSpace: 'pre-wrap' }}>{params.details}</pre> : null}
    </main>
  );
}
