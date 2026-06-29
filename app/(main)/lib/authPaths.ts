/**
 * Auth redirect helpers — always use site-relative paths so dev/staging/prod
 * stay on the current host (never hardcode automica.ai).
 */
export function encodeAuthRedirect(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return encodeURIComponent(normalized);
}

export function buildLoginPath(redirectPath: string, prompt: 'login' | 'register' = 'login'): string {
  const params = new URLSearchParams({
    post_login_redirect_url: redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`,
    prompt,
  });
  return `/api/auth/login?${params.toString()}`;
}

export function getPublicSiteUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_KINDE_SITE_URL || 'https://automica.ai';
}
