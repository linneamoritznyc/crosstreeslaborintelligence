const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function ensureConfigured(): string {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL saknas. Sätt variabeln i Vercel-projektets miljövariabler."
    );
  }
  return API_URL;
}

export function getApiUrl(): string {
  return ensureConfigured();
}

interface ApiOptions extends RequestInit {
  /** Sekunder innan request avbryts. Standard 15s. */
  timeoutSeconds?: number;
}

export async function apiClient<T>(path: string, init: ApiOptions = {}): Promise<T> {
  const base = ensureConfigured();
  const { timeoutSeconds = 15, signal: externalSignal, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutSeconds * 1000);

  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener("abort", () => controller.abort());
  }

  try {
    const res = await fetch(`${base}${path}`, {
      headers: { "Content-Type": "application/json", ...(rest.headers ?? {}) },
      cache: "no-store",
      ...rest,
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`API-fel ${res.status} vid ${path}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
