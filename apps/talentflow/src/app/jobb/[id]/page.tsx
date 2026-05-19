import Link from "next/link";
import AIDisclaimer from "@/components/AIDisclaimer";
import BackLink from "@/components/BackLink";
import SourceTag from "@/components/SourceTag";
import { apiClient } from "@/lib/api-client";

export const dynamic = "force-dynamic";

interface JobDetail {
  id?: string;
  headline?: string;
  description?: { text?: string; text_formatted?: string };
  employer?: { name?: string; workplace?: string };
  workplace_address?: { municipality?: string; region?: string };
  occupation?: { label?: string };
  publication_date?: string;
  application_deadline?: string;
  webpage_url?: string;
  source_links?: Array<{ url?: string }>;
  must_have?: { skills?: Array<{ concept_id: string; label: string }> };
  nice_to_have?: { skills?: Array<{ concept_id: string; label: string }> };
}

interface Props {
  params: Promise<{ id: string }>;
}

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("sv-SE");
  } catch {
    return iso;
  }
}

export default async function JobbDetaljPage({ params }: Props) {
  const { id } = await params;
  let job: JobDetail | null = null;
  let error: string | null = null;
  try {
    job = await apiClient<JobDetail>(`/jobs/${id}`);
  } catch (err) {
    error = err instanceof Error ? err.message : "Kunde inte hämta annonsen";
  }

  if (error || !job) {
    return (
      <section className="card">
        <h1>Annonsen kunde inte visas</h1>
        <p role="alert">{error}</p>
        <Link href="/" className="btn-link">
          Tillbaka
        </Link>
      </section>
    );
  }

  const employer = job.employer?.name ?? "Arbetsgivare ej angiven";
  const workplace = job.workplace_address?.municipality ?? job.employer?.workplace;
  const externalUrl =
    job.webpage_url ?? job.source_links?.[0]?.url ?? undefined;
  const mustSkills = job.must_have?.skills ?? [];
  const niceSkills = job.nice_to_have?.skills ?? [];
  const descriptionText =
    job.description?.text_formatted ?? job.description?.text ?? "";

  return (
    <>
      <section className="card">
        <BackLink />
        <h1 style={{ margin: "0 0 6px" }}>{job.headline ?? "Okänd titel"}</h1>
        <p style={{ color: "var(--color-ink-soft)", marginBottom: 12 }}>
          {employer}
          {workplace && ` · ${workplace}`}
          {job.occupation?.label && ` · ${job.occupation.label}`}
        </p>
        <div className="job-meta">
          {job.publication_date && (
            <span className="job-meta-item">
              Publicerad {formatDate(job.publication_date)}
            </span>
          )}
          {job.application_deadline && (
            <span className="job-meta-item">
              Sök senast {formatDate(job.application_deadline)}
            </span>
          )}
        </div>
        {externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-link"
            style={{ marginTop: 16 }}
          >
            Sök hos arbetsgivaren ↗
          </a>
        )}
      </section>

      {descriptionText && (
        <section className="card">
          <h2>Annonsbeskrivning</h2>
          <div
            style={{ whiteSpace: "pre-wrap", color: "var(--color-ink-soft)" }}
            dangerouslySetInnerHTML={{ __html: descriptionText }}
          />
        </section>
      )}

      {(mustSkills.length > 0 || niceSkills.length > 0) && (
        <section className="card">
          <h2>Kompetenskrav</h2>
          {mustSkills.length > 0 && (
            <>
              <h3 style={{ fontSize: "0.9375rem", marginTop: 8 }}>
                Obligatoriska
              </h3>
              <div className="skill-pills">
                {mustSkills.map((s) => (
                  <span key={s.concept_id} className="skill-pill missing">
                    {s.label}
                  </span>
                ))}
              </div>
            </>
          )}
          {niceSkills.length > 0 && (
            <>
              <h3 style={{ fontSize: "0.9375rem", marginTop: 16 }}>
                Meriterande
              </h3>
              <div className="skill-pills">
                {niceSkills.map((s) => (
                  <span key={s.concept_id} className="skill-pill preferred">
                    {s.label}
                  </span>
                ))}
              </div>
            </>
          )}
          <SourceTag source="AF Platsbanken (JobAd Enrichments)" />
        </section>
      )}

      <AIDisclaimer variant="long" />
    </>
  );
}
