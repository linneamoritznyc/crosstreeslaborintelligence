const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function ensureConfigured(): string {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL saknas. Sätt variabeln i Vercel.");
  }
  return API_URL;
}

export function getApiUrl(): string {
  return ensureConfigured();
}

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const base = ensureConfigured();
  const res = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API-fel ${res.status}: ${path}`);
  }
  return (await res.json()) as T;
}
