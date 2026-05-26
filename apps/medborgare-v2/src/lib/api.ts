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

/** SSE event types from /cv/parse-stream */
export type ParseStageEvent =
  | { stage: "reading" | "extracting" | "parsing" | "esco" }
  | { stage: "done"; session_id: string; skill_count: number }
  | { stage: "error"; code: "size" | "empty" | string };

/**
 * Strömmar CV-parsning via SSE. Kallar onStage för varje händelse.
 * Kastar ApiUnavailable/ApiError vid nätverks-/serverfel.
 */
export async function parseCvStream(
  file: File,
  onStage: (event: ParseStageEvent) => void,
): Promise<CvParseResponse> {
  if (!API_URL) throw new ApiUnavailable("/cv/parse-stream");

  const form = new FormData();
  form.append("file", file);

  let res: Response;
  try {
    res = await fetch(`${API_URL}/cv/parse-stream`, { method: "POST", body: form });
  } catch (cause) {
    throw new ApiUnavailable("/cv/parse-stream", cause);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError("/cv/parse-stream", res.status, body);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const blocks = buf.split("\n\n");
    buf = blocks.pop() ?? "";
    for (const block of blocks) {
      const dataLine = block.split("\n").find((l) => l.startsWith("data: "));
      if (!dataLine) continue;
      try {
        const evt = JSON.parse(dataLine.slice(6)) as ParseStageEvent;
        onStage(evt);
        if (evt.stage === "done") {
          return { session_id: evt.session_id, skill_count: evt.skill_count };
        }
        if (evt.stage === "error") {
          if (evt.code === "size") throw new ApiError("/cv/parse-stream", 413, "Filen är för stor");
          throw new ApiError("/cv/parse-stream", 422, `Parsning misslyckades: ${evt.code}`);
        }
      } catch (e) {
        if (e instanceof ApiError) throw e;
        // malformed SSE line — ignore
      }
    }
  }

  throw new ApiError("/cv/parse-stream", 500, "SSE-strömmen avslutades utan done-event");
}

export interface CvSession {
  session_id: string;
  skills: string[];
  skill_count: number;
}

export async function getSession(sessionId: string): Promise<CvSession> {
  return apiFetch<CvSession>(`/cv/session/${encodeURIComponent(sessionId)}`);
}

export interface AddSkillsResponse {
  session_id: string;
  skills: string[];
  skill_count: number;
  added: number;
}

export async function addSkillsToSession(
  sessionId: string,
  skills: string[],
): Promise<AddSkillsResponse> {
  return apiFetch<AddSkillsResponse>(`/cv/session/${encodeURIComponent(sessionId)}/skills`, {
    method: "PATCH",
    body: JSON.stringify({ skills }),
  });
}

export interface EscoSkill {
  concept_id: string;
  preferred_label?: string;
  label?: string;
  type?: string;
}

export async function searchSkills(q: string): Promise<EscoSkill[]> {
  return apiFetch<EscoSkill[]>(`/skills/?q=${encodeURIComponent(q)}`);
}

export interface SessionLog {
  session_id: string;
  logged_fields: { field: string; description: string }[];
  retention: { session_skills: string; ai_act_log: string };
  data_controller: string;
  ai_system: string;
  your_rights: string;
  no_personal_data: boolean;
  current_skill_count: number;
}

export async function getSessionLog(sessionId: string): Promise<SessionLog> {
  return apiFetch<SessionLog>(`/cv/session/${encodeURIComponent(sessionId)}/log`);
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

export async function getMatchedJobs(sessionId: string, region?: string): Promise<JobHit[]> {
  const params = new URLSearchParams({ session: sessionId });
  if (region) params.set("region", region);
  return apiFetch<JobHit[]>(`/match/jobs?${params.toString()}`);
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

/** Platsbanken URL for a job ad */
export function platsbankenUrl(jobId: string): string {
  return `https://arbetsformedlingen.se/platsbanken/annonser/${jobId}`;
}
