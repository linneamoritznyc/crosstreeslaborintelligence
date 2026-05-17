"""Normaliserar kompetenskoncept inkl. alternativa etiketter och ESCO-URI."""
from __future__ import annotations

from typing import Any

from .._shared.logging import get_logger

log = get_logger(__name__)

_ALT_LABEL_KEYS = ("alternative_labels", "alternativeLabels", "alt_labels")
_ESCO_KEYS = ("esco_uri", "escoUri")
_REF_KEYS = ("external_references", "references")


def _first(raw: dict, *keys: str) -> str | None:
    for key in keys:
        value = raw.get(key)
        if isinstance(value, str) and value:
            return value
    return None


def _extract_alt_labels(raw: dict) -> list[str]:
    collected: list[str] = []
    for key in _ALT_LABEL_KEYS:
        value = raw.get(key)
        if isinstance(value, list):
            collected.extend(str(item) for item in value if item)
        elif isinstance(value, str) and value:
            # AF returnerar ibland en rörseparerad sträng — normalisera.
            collected.extend(
                part.strip() for part in value.split("|") if part.strip()
            )

    seen: set[str] = set()
    deduped: list[str] = []
    for label in collected:
        if label not in seen:
            seen.add(label)
            deduped.append(label)
    return deduped


def _extract_esco_uri(raw: dict) -> str | None:
    direct = _first(raw, *_ESCO_KEYS)
    if direct:
        return direct

    for ref_key in _REF_KEYS:
        refs = raw.get(ref_key)
        if not isinstance(refs, list):
            continue
        for ref in refs:
            if not isinstance(ref, dict):
                continue
            source = ref.get("source") or ref.get("name") or ""
            if isinstance(source, str) and source.lower() == "esco":
                uri = ref.get("uri") or ref.get("url")
                if isinstance(uri, str) and uri:
                    return uri
    return None


def transform_skill(raw: dict) -> dict | None:
    cid = _first(raw, "concept_id", "id")
    name = _first(raw, "preferred_label", "preferredLabel")
    if not cid or not name:
        return None
    return {
        "id": cid,
        "name": name,
        "alt_labels": _extract_alt_labels(raw),
        "esco_uri": _extract_esco_uri(raw),
    }


def transform_skills(raw_skills: list[dict]) -> list[dict]:
    result: list[dict] = []
    skipped = 0
    for raw in raw_skills:
        normalized = transform_skill(raw)
        if normalized is None:
            skipped += 1
            continue
        result.append(normalized)
    log.info(
        "skills.transformed",
        total=len(raw_skills),
        kept=len(result),
        skipped=skipped,
        with_esco=sum(1 for s in result if s["esco_uri"]),
        with_alt_labels=sum(1 for s in result if s["alt_labels"]),
    )
    return result
