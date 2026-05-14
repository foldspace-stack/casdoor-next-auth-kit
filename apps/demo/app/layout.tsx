import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, fontFamily: 'ui-sans-serif, system-ui, sans-serif', background: '#f7f4ef', color: '#1f2937' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 24px 72px' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
