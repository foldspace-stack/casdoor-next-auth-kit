export function buildCasdoorProxyRequestHeaders(request: Pick<Request, 'headers'>): Headers {
  const headers = new Headers();
  const allowedHeaderNames = [
    'accept',
    'accept-language',
    'authorization',
    'content-type',
    'x-requested-with',
  ];

  for (const headerName of allowedHeaderNames) {
    const value = request.headers.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  }

  return headers;
}
