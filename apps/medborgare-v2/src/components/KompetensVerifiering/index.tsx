"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { addSkillsToSession, searchSkills, type EscoSkill } from "@/lib/api";

interface Props {
  sessionId: string;
  skills: string[];
  filename?: string;
}

const STORAGE_KEY = (id: string) => `cv:${id}:boundaries`;
const REGION_KEY = (id: string) => `cv:${id}:region`;

interface Boundaries {
  mutedSkills: string[];
  mutedTopics: string[];
}

function loadBoundaries(sessionId: string): Boundaries {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY(sessionId));
    if (!raw) return { mutedSkills: [], mutedTopics: [] };
    const p = JSON.parse(raw);
    return {
      mutedSkills: Array.isArray(p.mutedSkills) ? p.mutedSkills : [],
      mutedTopics: Array.isArray(p.mutedTopics) ? p.mutedTopics : [],
    };
  } catch {
    return { mutedSkills: [], mutedTopics: [] };
  }
}

function saveBoundaries(sessionId: string, b: Boundaries) {
  try {
    sessionStorage.setItem(STORAGE_KEY(sessionId), JSON.stringify(b));
  } catch { /* best-effort */ }
}

export const SWEDISH_REGIONS: { code: string; name: string }[] = [
  { code: "01", name: "Stockholms län" },
  { code: "03", name: "Uppsala län" },
  { code: "04", name: "Södermanlands län" },
  { code: "05", name: "Östergötlands län" },
  { code: "06", name: "Jönköpings län" },
  { code: "07", name: "Kronobergs län" },
  { code: "08", name: "Kalmar län" },
  { code: "09", name: "Gotlands län" },
  { code: "10", name: "Blekinge län" },
  { code: "12", name: "Skåne län" },
  { code: "13", name: "Hallands län" },
  { code: "14", name: "Västra Götalands län" },
  { code: "17", name: "Värmlands län" },
  { code: "18", name: "Örebro län" },
  { code: "19", name: "Västmanlands län" },
  { code: "20", name: "Dalarnas län" },
  { code: "21", name: "Gävleborgs län" },
  { code: "22", name: "Västernorrlands län" },
  { code: "23", name: "Jämtlands län" },
  { code: "24", name: "Västerbottens län" },
  { code: "25", name: "Norrbottens län" },
];

export default function KompetensVerifiering({ sessionId, skills: initialSkills, filename }: Props) {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [muted, setMuted] = useState<Set<string>>(new Set());
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [region, setRegion] = useState("06"); // Jönköpings län default
  const [resolvedFilename, setResolvedFilename] = useState(filename ?? "");

  // Add-skill state
  const [skillQuery, setSkillQuery] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState<EscoSkill[]>([]);
  const [skillSearching, setSkillSearching] = useState(false);
  const [addError, setAddError] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fortsätt-senare state
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const b = loadBoundaries(sessionId);
    setMuted(new Set(b.mutedSkills));
    setTopics(b.mutedTopics);
    try {
      const saved = sessionStorage.getItem(REGION_KEY(sessionId));
      if (saved) setRegion(saved);
      if (!filename) {
        const fn = sessionStorage.getItem(`cv:${sessionId}:filename`);
        if (fn) setResolvedFilename(fn);
      }
    } catch { /* ok */ }
  }, [sessionId, filename]);

  useEffect(() => {
    saveBoundaries(sessionId, { mutedSkills: Array.from(muted), mutedTopics: topics });
  }, [sessionId, muted, topics]);

  useEffect(() => {
    try { sessionStorage.setItem(REGION_KEY(sessionId), region); } catch { /* ok */ }
  }, [sessionId, region]);

  const visibleCount = skills.length - muted.size;

  const sortedSkills = useMemo(
    () => [...skills].sort((a, b) => a.localeCompare(b, "sv")),
    [skills],
  );

  function toggle(skill: string) {
    setMuted((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  }

  function addTopic(e: React.FormEvent) {
    e.preventDefault();
    const t = topicInput.trim();
    if (!t) return;
    if (!topics.includes(t.toLowerCase())) setTopics([...topics, t.toLowerCase()]);
    setTopicInput("");
  }

  function removeTopic(t: string) {
    setTopics(topics.filter((x) => x !== t));
  }

  const onSkillQueryChange = useCallback((q: string) => {
    setSkillQuery(q);
    setAddError("");
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (q.trim().length < 2) { setSkillSuggestions([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSkillSearching(true);
      try {
        const results = await searchSkills(q.trim());
        setSkillSuggestions(results.slice(0, 8));
      } catch {
        setSkillSuggestions([]);
      } finally {
        setSkillSearching(false);
      }
    }, 320);
  }, []);

  async function pickSkill(skill: EscoSkill) {
    const label = skill.preferred_label ?? skill.label ?? skill.concept_id;
    if (!label) return;
    setSkillQuery("");
    setSkillSuggestions([]);
    setAddError("");
    try {
      const res = await addSkillsToSession(sessionId, [label]);
      setSkills(res.skills);
    } catch {
      setAddError("Kunde inte lägga till kompetensen just nu. Försök igen.");
    }
  }

  function copyLink() {
    const url = window.location.href;
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  const matchUrl = `/matchningar/${sessionId}?region=${region}`;

  return (
    <>
      {/* Region selector (#3) */}
      <section className="sheet-section">
        <h2 className="sheet-section-head">
          <span>Sökregion</span>
          <span className="step-num">var</span>
        </h2>
        <p className="sheet-prose">
          Välj vilket län du vill söka jobb i. Matchningen hämtar annonser
          enbart från det valda länet.
        </p>
        <div className="region-selector">
          <label htmlFor="region-select" className="region-label">Län</label>
          <select
            id="region-select"
            className="region-select"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            {SWEDISH_REGIONS.map((r) => (
              <option key={r.code} value={r.code}>{r.name}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Skill verification */}
      <section className="sheet-section">
        <h2 className="sheet-section-head">
          <span>
            Extraherade kompetenser
            {resolvedFilename && (
              <span style={{ color: "var(--ink-faint)", marginLeft: 14, fontWeight: 400 }}>
                · {resolvedFilename}
              </span>
            )}
          </span>
          <span className="step-num">verifiera</span>
        </h2>
        <p className="sheet-prose">
          Det här är allt AI:n läste från ditt dokument. Om något inte
          stämmer — välj <em>tysta</em>. Tystade kompetenser används inte
          i matchningen.
        </p>

        <p className="skill-summary">
          {skills.length} kompetenser totalt ·{" "}
          <span className="count">{visibleCount}</span> aktiva
          {muted.size > 0 && (
            <> · <span className="muted">{muted.size} tysta</span></>
          )}
        </p>

        {sortedSkills.length === 0 ? (
          <div className="skill-empty">
            Vi hittade inga kompetenser. Ladda gärna upp CV:t igen, helst
            som text-PDF eller DOCX (skannade bilder fungerar inte).
          </div>
        ) : (
          <ol className="skill-table">
            {sortedSkills.map((skill, i) => {
              const isMuted = muted.has(skill);
              return (
                <li key={skill} className="skill-row" data-muted={isMuted}>
                  <span className="skill-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="skill-name">{skill}</span>
                  <button
                    type="button"
                    className="skill-toggle"
                    onClick={() => toggle(skill)}
                    aria-label={
                      isMuted
                        ? `Återställ ${skill} — används igen i matchningen`
                        : `Tysta ${skill} — används inte i matchningen`
                    }
                  >
                    {isMuted ? "Återställ" : "Tysta"}
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        {/* Add skill (#2) */}
        <div className="add-skill">
          <p className="add-skill-label">Saknas något? Sök och lägg till kompetens:</p>
          <div className="add-skill-row">
            <input
              type="search"
              className="add-skill-input"
              placeholder="till exempel systemutveckling, svetsning, Excel"
              value={skillQuery}
              onChange={(e) => onSkillQueryChange(e.target.value)}
              aria-label="Sök kompetens att lägga till"
              aria-autocomplete="list"
              aria-expanded={skillSuggestions.length > 0}
              autoComplete="off"
            />
            {skillSearching && (
              <span className="add-skill-spinner" aria-label="Söker…" />
            )}
          </div>
          {skillSuggestions.length > 0 && (
            <ul className="skill-suggestions" role="listbox" aria-label="Kompetensförslag">
              {skillSuggestions.map((s) => {
                const label = s.preferred_label ?? s.label ?? s.concept_id;
                return (
                  <li key={s.concept_id} role="option">
                    <button
                      type="button"
                      className="skill-suggestion-btn"
                      onClick={() => void pickSkill(s)}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {addError && (
            <p className="add-skill-error" role="alert">{addError}</p>
          )}
        </div>
      </section>

      {/* Boundaries */}
      <section className="sheet-section">
        <h2 className="sheet-section-head">
          <span>Gränser — frivilligt</span>
          <span className="step-num">valfritt</span>
        </h2>
        <div className="boundaries">
          <p className="boundaries-prompt">
            Finns det ämnen, branscher eller jobbtyper du inte vill bli
            matchad mot, även om ditt CV pekar dit? Lägg till dem här.
            Jobb som innehåller orden i sin beskrivning visas inte.
            Du behöver inte förklara varför.
          </p>
          <form className="boundaries-input-row" onSubmit={addTopic} aria-label="Lägg till gräns">
            <input
              type="text"
              className="boundaries-input"
              placeholder="till exempel nattskift, kundtjänst, kemi"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              maxLength={40}
              aria-label="Ange ämne att utesluta"
            />
            <button type="submit" className="boundaries-add">
              Lägg till
            </button>
          </form>
          {topics.length > 0 && (
            <div className="boundaries-chips" aria-label="Aktiva gränser">
              {topics.map((t) => (
                <span key={t} className="boundaries-chip">
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTopic(t)}
                    aria-label={`Ta bort gräns: ${t}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Fortsätt senare (#4) */}
      <section className="sheet-section">
        <h2 className="sheet-section-head">
          <span>Fortsätt senare</span>
          <span className="step-num">länk</span>
        </h2>
        <p className="sheet-prose">
          Den här sidans adress innehåller ditt session-ID. Kopiera länken
          för att komma tillbaka till din verifiering inom 24 timmar.
          Efter det raderas sessionen automatiskt.
        </p>
        <button
          type="button"
          className="fortsatt-btn"
          onClick={copyLink}
          aria-live="polite"
        >
          {copied ? "Länken kopierad ✓" : "Kopiera sessionslänk"}
        </button>
      </section>

      <Link href={matchUrl} className="next-step">
        Sök matchningar <span className="arrow">→</span>
      </Link>
    </>
  );
}
