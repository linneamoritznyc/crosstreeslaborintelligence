"""Normaliserar yrkeskoncept och bifogar SSYK-kod + arbetstidsmodell.

Inputfält som saknas leder till att posten hoppas över (loggas) — aldrig
fabricerade default-värden enligt OPTIMIZED_CODEBASE_GUIDELINES.md.
"""
from __future__ import annotations

import json
from pathlib import Path

from .._shared.logging import get_logger

log = get_logger(__name__)


def _first(raw: dict, *keys: str) -> str | None:
    for key in keys:
        value = raw.get(key)
        if isinstance(value, str) and value:
            return value
    return None


def build_ssyk_map(ssyk_groups: list[dict]) -> dict[str, str]:
    """concept_id → SSYK-2012 fyrsiffrig kod.

    Förutsätter strukturen i ssyk-level-4-groups-with-related-occupations.json.
    """
    mapping: dict[str, str] = {}
    for group in ssyk_groups:
        ssyk_code = _first(group, "ssyk_code_2012", "ssyk_code", "code")
        related = (
            group.get("related_occupations")
            or group.get("occupations")
            or []
        )
        if not ssyk_code or not isinstance(related, list):
            continue
        for occ in related:
            if not isinstance(occ, dict):
                continue
            cid = _first(occ, "concept_id", "id")
            if cid:
                mapping[cid] = str(ssyk_code)
    log.info("ssyk_map.built", entries=len(mapping))
    return mapping


def build_workplace_model_map(working_hours_concepts: list[dict]) -> dict[str, str]:
    """concept_id → arbetstidsmodell (heltid, deltid, skiftarbete, …)."""
    mapping: dict[str, str] = {}
    for concept in working_hours_concepts:
        if not isinstance(concept, dict):
            continue
        cid = _first(concept, "concept_id", "id")
        label = _first(concept, "preferred_label", "preferredLabel", "label")
        if cid and label:
            mapping[cid] = label
    return mapping


def transform_occupation(
    raw: dict,
    ssyk_map: dict[str, str],
    workplace_model_map: dict[str, str] | None = None,
) -> dict | None:
    cid = _first(raw, "concept_id", "id")
    name = _first(raw, "preferred_label", "preferredLabel")
    if not cid or not name:
        return None

    workplace_model: str | None = None
    if workplace_model_map:
        refs = raw.get("working_hours_refs") or []
        if isinstance(refs, list):
            for ref in refs:
                if isinstance(ref, str) and ref in workplace_model_map:
                    workplace_model = workplace_model_map[ref]
                    break

    definition = raw.get("definition")
    if not isinstance(definition, str):
        definition = None

    return {
        "id": cid,
        "name": name,
        "ssyk_code": ssyk_map.get(cid),
        "definition": definition,
        "workplace_model": workplace_model,
    }


def transform_occupations(
    raw_occupations: list[dict],
    ssyk_groups: list[dict] | None = None,
    working_hours_concepts: list[dict] | None = None,
) -> list[dict]:
    ssyk_map = build_ssyk_map(ssyk_groups or [])
    wh_map = build_workplace_model_map(working_hours_concepts or [])

    result: list[dict] = []
    skipped = 0
    for raw in raw_occupations:
        normalized = transform_occupation(raw, ssyk_map, wh_map)
        if normalized is None:
            skipped += 1
            continue
        result.append(normalized)

    log.info(
        "occupations.transformed",
        total=len(raw_occupations),
        kept=len(result),
        skipped=skipped,
        ssyk_coverage=sum(1 for o in result if o["ssyk_code"]),
    )
    return result


def load_static_dataset(path: Path) -> list[dict]:
    """Hjälpfunktion för transform-orkestrering: läser nedladdad JSON-fil."""
    if not path.exists():
        log.warning("static_dataset.missing", path=str(path))
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        log.error("static_dataset.invalid_json", path=str(path), fel=str(exc))
        return []
    return data if isinstance(data, list) else []
