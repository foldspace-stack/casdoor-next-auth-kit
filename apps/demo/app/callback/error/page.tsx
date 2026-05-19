'use client';

import { useState } from 'react';

const AUTH_COOKIE_NAMES = [
  'auth_origin',
  'auth_redirect',
  'oauth_state',
  'pkce_code_verifier',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  'next-auth.csrf-token',
  '__Secure-next-auth.csrf-token',
  '__Host-next-auth.csrf-token',
];

function getPathCandidates(pathname: string): string[] {
  const normalized = pathname.startsWith('/') ? pathname : '/' + pathname;
  const segments = normalized.split('/').filter(Boolean);
  const paths = new Set<string>(['/']);

  let current = '';
  for (const segment of segments) {
    current += '/' + segment;
    paths.add(current);
  }

  return [...paths];
}

function getDomainCandidates(hostname: string): string[] {
  const normalized = hostname.toLowerCase();
  if (
    normalized === 'localhost' ||
    normalized.endsWith('.localhost') ||
    /^\d+\.\d+\.\d+\.\d+$/.test(normalized) ||
    /^\[[^\]]+\]$/.test(normalized)
  ) {
    return [];
  }

  const parts = normalized.split('.');
  if (parts.length < 2) {
    return [];
  }

  const domains = new Set<string>();
  for (let index = 0; index < parts.length - 1; index++) {
    const suffix = parts.slice(index).join('.');
    domains.add(suffix);
    domains.add('.' + suffix);
  }

  return [...domains];
}

function expireCookie(name: string, path: string, domain?: string) {
  const pieces = [
    name + '=',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'Path=' + path,
    'SameSite=Lax',
  ];

  if (domain) {
    pieces.push('Domain=' + domain);
  }

  if (window.location.protocol === 'https:') {
    pieces.push('Secure');
  }

  document.cookie = pieces.join('; ');
}

function ClearDomainCookiesButton() {
  const [cleared, setCleared] = useState(false);

  const handleClick = () => {
    const names = new Set<string>(AUTH_COOKIE_NAMES);
    for (const entry of document.cookie.split(';')) {
      const [rawName] = entry.trim().split('=');
      if (rawName) {
        names.add(rawName);
      }
    }

    const pathCandidates = getPathCandidates(window.location.pathname);
    const domainCandidates = getDomainCandidates(window.location.hostname);

    for (const name of names) {
      for (const path of pathCandidates) {
        expireCookie(name, path);
        for (const domain of domainCandidates) {
          expireCookie(name, path, domain);
        }
      }
    }

    setCleared(true);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={cleared}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
        padding: '0 16px',
        borderRadius: 9999,
        border: '1px solid rgba(148, 163, 184, 0.35)',
        color: '#0f172a',
        background: cleared ? 'rgba(220, 252, 231, 0.92)' : 'rgba(248, 250, 252, 0.9)',
        cursor: cleared ? 'default' : 'pointer',
      }}
    >
      {cleared ? '已清空' : '清空当前域 Cookie'}
    </button>
  );
}

export default async function CallbackErrorPage({ searchParams }: { searchParams: Promise<{ title?: string; message?: string; details?: string }> }) {
  const params = await searchParams;
  return (
    <main style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}>
      <h2 style={{ marginTop: 0 }}>{params.title ?? 'Callback Error'}</h2>
      <p>{params.message ?? 'Unknown callback failure.'}</p>
      {params.details ? <pre style={{ whiteSpace: 'pre-wrap' }}>{params.details}</pre> : null}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
        <ClearDomainCookiesButton />
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, padding: '0 16px', borderRadius: 9999, border: '1px solid rgba(148, 163, 184, 0.35)', color: '#0f172a', textDecoration: 'none', background: 'rgba(248, 250, 252, 0.9)' }}>返回首页</a>
        <a href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, padding: '0 16px', borderRadius: 9999, border: '1px solid rgba(148, 163, 184, 0.35)', color: '#0f172a', textDecoration: 'none', background: 'rgba(248, 250, 252, 0.9)' }}>重新登录</a>
        <a href="/auth/signup" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, padding: '0 16px', borderRadius: 9999, border: '1px solid rgba(148, 163, 184, 0.35)', color: '#0f172a', textDecoration: 'none', background: 'rgba(248, 250, 252, 0.9)' }}>去注册</a>
      </div>
    </main>
  );
}
