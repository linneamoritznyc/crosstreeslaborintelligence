/**
 * Direktklient mot matching-api på Railway.
 * Nyckelprincip: ApiError bär status + endpoint, så UI:t kan välja
 * mellan "försök igen", "degraded mode" och "ge upp ärligt".
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    public readonly endpoint: string,
    public readonly status: number,
    public readonly body: string,
  ) {
    super(`API ${status} · ${endpoint}`);
    this.name = "ApiError";
  }
}

export class ApiUnavailable extends Error {
  constructor(public readonly endpoint: string, cause?: unknown) {
    super(`API onåbart · ${endpoint}`);
    this.name = "ApiUnavailable";
    if (cause) this.cause = cause;
  }
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit & { rawForm?: FormData },
): Promise<T> {
  if (!API_URL) {
    throw new ApiUnavailable(path, new Error("NEXT_PUBLIC_API_URL saknas"));
  }

  const url = `${API_URL}${path}`;
  let res: Response;

  try {
    res = await fetch(url, {
      ...init,
      headers: init?.rawForm
        ? init.headers
        : { "Content-Type": "application/json", ...init?.headers },
      body: init?.rawForm ?? init?.body,
    });
  } catch (cause) {
    throw new ApiUnavailable(path, cause);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(path, res.status, body);
  }

  return res.json() as Promise<T>;
}

export interface CvParseResponse {
  session_id: string;
  skill_count: number;
}

export async function parseCv(file: File): Promise<CvParseResponse> {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<CvParseResponse>("/cv/parse", {
    method: "POST",
    rawForm: form,
  });
}

export interface CvSession {
  session_id: string;
  skills: string[];
  skill_count: number;
}

export async function getSession(sessionId: string): Promise<CvSession> {
  return apiFetch<CvSession>(`/cv/session/${encodeURIComponent(sessionId)}`);
}

export interface ConfidenceInterval {
  low: number;
  high: number;
  method: string;
}

export interface FitScore {
  score: number;
  matched_required: string[];
  missing_required: string[];
  missing_preferred: string[];
  confidence_interval: ConfidenceInterval;
}

export async function getFitScore(
  sessionId: string,
  jobId: string,
): Promise<FitScore> {
  return apiFetch<FitScore>(
    `/match/score?session=${encodeURIComponent(sessionId)}&job=${encodeURIComponent(jobId)}`,
  );
}

export interface JobHit {
  id: string;
  headline?: string;
  title?: string;
  employer?: { name?: string } | string;
  workplace_address?: { municipality?: string; region?: string };
  publication_date?: string;
  description?: { text?: string };
  occupation?: { label?: string };
}

export async function getMatchedJobs(sessionId: string): Promise<JobHit[]> {
  return apiFetch<JobHit[]>(
    `/match/jobs?session=${encodeURIComponent(sessionId)}`,
  );
}

export async function getJobDetail(jobId: string): Promise<JobHit> {
  return apiFetch<JobHit>(`/jobs/${encodeURIComponent(jobId)}`);
}

/** Quality classification — depth-style. */
export function depthClass(score: number): "high" | "mid" | "low" {
  if (score >= 70) return "high";
  if (score >= 45) return "mid";
  return "low";
}

export function employerName(job: JobHit): string {
  if (typeof job.employer === "string") return job.employer;
  return job.employer?.name ?? "Okänd arbetsgivare";
}

export function jobTitle(job: JobHit): string {
  return job.headline ?? job.title ?? job.occupation?.label ?? "Tjänst utan titel";
}

export function jobLocation(job: JobHit): string {
  return job.workplace_address?.municipality ?? job.workplace_address?.region ?? "";
}
