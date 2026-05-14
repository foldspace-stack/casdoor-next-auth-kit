const DEFAULT_ADMIN_EMAILS = ['admin@example.com'];

function readAdminEmailSource(): string {
  return process.env.GLOBAL_ADMIN_EMAILS || process.env.ADMIN_EMAILS || '';
}

export function getGlobalAdminEmails(): string[] {
  const source = readAdminEmailSource();
  if (!source) {
    return DEFAULT_ADMIN_EMAILS;
  }

  return source
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isGlobalAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  return getGlobalAdminEmails().includes(email.toLowerCase());
}
