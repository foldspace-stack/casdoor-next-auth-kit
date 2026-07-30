import type { NextRequest } from 'next/server.js';
import type { AuthKitConfig } from '../shared/types';
import type {
  BillingCasdoorAccountDetail,
  BillingCasdoorAccountResponse,
  BillingCasdoorApplicationDetail,
  BillingCasdoorApplicationResponse,
} from '../shared/types';
import { getRequestOrigin } from '../shared/core';
import { normalizeAuthKitConfig } from '../shared/config';

interface CasdoorDataEnvelope<T> {
  data?: T;
}

function extractCasdoorData<T>(value: T | CasdoorDataEnvelope<T> | null | undefined): T | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'object' && value !== null && 'data' in value) {
    return (value as CasdoorDataEnvelope<T>).data;
  }

  return value as T;
}

async function fetchCasdoorProxyJson<T>(url: string, request: NextRequest): Promise<T | undefined> {
  try {
    const response = await fetch(url, {
      headers: {
        cookie: request.headers.get('cookie') || '',
        referer: request.headers.get('referer') || '',
        origin: request.headers.get('origin') || '',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return undefined;
    }

    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}

export interface AuthPortalContext {
  application?: BillingCasdoorApplicationDetail;
  account?: BillingCasdoorAccountDetail;
}

export async function loadAuthPortalContext(request: NextRequest, config: AuthKitConfig): Promise<AuthPortalContext> {
  const normalized = normalizeAuthKitConfig(config);
  const origin = getRequestOrigin(request, normalized.appUrl);
  const applicationId = `${normalized.casdoor.organizationName}/${normalized.casdoor.appName}`;
  const applicationUrl = new URL('/auth/api/get-application', origin);
  applicationUrl.searchParams.set('id', applicationId);

  const applicationResponse = await fetchCasdoorProxyJson<BillingCasdoorApplicationResponse | BillingCasdoorApplicationDetail>(
    applicationUrl.toString(),
    request,
  );
  const application = extractCasdoorData(applicationResponse);

  const hasSession =
    Boolean(request.cookies.get('__Secure-next-auth.session-token')?.value) ||
    Boolean(request.cookies.get('next-auth.session-token')?.value) ||
    request.cookies.getAll().some((cookie) =>
      cookie.name.startsWith('__Secure-next-auth.session-token.') ||
      cookie.name.startsWith('next-auth.session-token.') ||
      cookie.name.startsWith('__Host-next-auth.session-token.'),
    );

  if (!hasSession) {
    return { application };
  }

  const accountUrl = new URL('/auth/api/get-account', origin);
  const accountResponse = await fetchCasdoorProxyJson<BillingCasdoorAccountResponse | BillingCasdoorAccountDetail>(
    accountUrl.toString(),
    request,
  );
  const account = extractCasdoorData(accountResponse);

  return { application, account };
}
