// Resolves the canonical base URL from env vars.
// Set NEXT_PUBLIC_SITE_URL in Vercel project settings to your custom domain.
// Falls back to the auto-provided VERCEL_URL on preview/production deploys.
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
