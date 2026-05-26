"use client";

/**
 * Visar de kompetenser systemet läste från CV:t och låter användaren
 * tona ner enskilda kompetenser eller lägga till generella ämnen som
 * inte ska matchas mot.
 *
 * Lärdom från antiapathyjobportal:s `never_mention`-system: detta är
 * inte ett filtersystem, det är ett värdighetssystem. En medborgare
 * ska kunna säga "matcha mig inte mot detta" utan att förklara varför.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface Props {
  sessionId: string;
  skills: string[];
  filename?: string;
}

const STORAGE_KEY = (sessionId: string) => `cv:${sessionId}:boundaries`;

interface Boundaries {
  mutedSkills: string[];
  mutedTopics: string[];
}

function loadBoundaries(sessionId: string): Boundaries {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY(sessionId));
    if (!raw) return { mutedSkills: [], mutedTopics: [] };
    const parsed = JSON.parse(raw);
    return {
      mutedSkills: Array.isArray(parsed.mutedSkills) ? parsed.mutedSkills : [],
      mutedTopics: Array.isArray(parsed.mutedTopics) ? parsed.mutedTopics : [],
    };
  } catch {
    return { mutedSkills: [], mutedTopics: [] };
  }
}

function saveBoundaries(sessionId: string, b: Boundaries) {
  try {
    sessionStorage.setItem(STORAGE_KEY(sessionId), JSON.stringify(b));
  } catch {
    // Tyst — boundaries är en best-effort funktion.
  }
}

export default function KompetensVerifiering({ sessionId, skills, filename }: Props) {
  const [muted, setMuted] = useState<Set<string>>(new Set());
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");

  useEffect(() => {
    const b = loadBoundaries(sessionId);
    setMuted(new Set(b.mutedSkills));
    setTopics(b.mutedTopics);
  }, [sessionId]);

  useEffect(() => {
    saveBoundaries(sessionId, {
      mutedSkills: Array.from(muted),
      mutedTopics: topics,
    });
  }, [sessionId, muted, topics]);

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
    if (topics.includes(t.toLowerCase())) {
      setTopicInput("");
      return;
    }
    setTopics([...topics, t.toLowerCase()]);
    setTopicInput("");
  }

  function removeTopic(t: string) {
    setTopics(topics.filter((x) => x !== t));
  }

  return (
    <>
      <section className="sheet-section">
        <h2 className="sheet-section-head">
          <span>
            Extraherade kompetenser
            {filename && (
              <span style={{ color: "var(--ink-faint)", marginLeft: 14, fontWeight: 400 }}>
                · {filename}
              </span>
            )}
          </span>
          <span className="step-num">verifiera</span>
        </h2>
        <p className="sheet-prose">
          Det här är exakt vad språkmodellen läste ur ditt dokument.
          Om något inte stämmer — om en kompetens är fel eller om du inte
          vill bli matchad mot den — markera <em>tysta</em>. Tystade
          kompetenser används inte i matchningen.
        </p>

        <p className="skill-summary">
          {skills.length} kompetenser totalt ·{" "}
          <span className="count">{visibleCount}</span> aktiva
          {muted.size > 0 && (
            <>
              {" "}
              · <span className="muted">{muted.size} tysta</span>
            </>
          )}
        </p>

        {sortedSkills.length === 0 ? (
          <div className="skill-empty">
            Inga kompetenser hittades. Det här är ovanligt — ladda gärna upp
            CV:t igen i ett textbaserat format.
          </div>
        ) : (
          <ol className="skill-table">
            {sortedSkills.map((skill, i) => {
              const isMuted = muted.has(skill);
              return (
                <li
                  key={skill}
                  className="skill-row"
                  data-muted={isMuted}
                >
                  <span className="skill-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="skill-name">{skill}</span>
                  <button
                    type="button"
                    className="skill-toggle"
                    onClick={() => toggle(skill)}
                  >
                    {isMuted ? "Återställ" : "Tysta"}
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className="sheet-section">
        <h2 className="sheet-section-head">
          <span>Gränser — frivilligt</span>
          <span className="step-num">valfritt</span>
        </h2>
        <div className="boundaries">
          <p className="boundaries-prompt">
            Finns det ämnen, sektorer eller jobbtyper du inte vill matchas
            mot, oavsett vad ditt CV säger? Lägg till dem här. Jobb vars
            beskrivning innehåller dessa ord visas inte.
          </p>
          <form className="boundaries-input-row" onSubmit={addTopic}>
            <input
              type="text"
              className="boundaries-input"
              placeholder="t.ex. nattskift, kundtjänst, kemi"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              maxLength={40}
            />
            <button type="submit" className="boundaries-add">
              Lägg till
            </button>
          </form>
          {topics.length > 0 && (
            <div className="boundaries-chips">
              {topics.map((t) => (
                <span key={t} className="boundaries-chip">
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTopic(t)}
                    aria-label={`Ta bort ${t}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <Link href={`/matchningar/${sessionId}`} className="next-step">
        Sök matchningar <span className="arrow">→</span>
      </Link>
    </>
  );
}
