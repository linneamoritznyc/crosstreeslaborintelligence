const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL saknas i miljövariabler");
  }
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    throw new Error(`API-fel ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}
