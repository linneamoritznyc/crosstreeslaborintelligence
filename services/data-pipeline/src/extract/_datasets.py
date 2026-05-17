"""Skrapar AF Data Portal-sidor och laddar ner statiska JSON-dataset.

AF publicerar SUN/SNI/SSYK-hierarkierna som nedladdningsbara JSON-filer
via dataset-sidor som ``data.arbetsformedlingen.se/data/dataset/{slug}/``.
Sidorna är HTML — vi extraherar första .json-länken och hämtar filen.
"""
from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import urljoin

import httpx

from .._shared.http import request_with_retry
from .._shared.logging import get_logger

log = get_logger(__name__)

DATASET_PORTAL_BASE = "https://data.arbetsformedlingen.se/data/dataset"

# Sluggar verifierade mot AF:s produktionsportal (samma uppsättning som
# gamla repots scripts/download_all_datasets.py).
DATASET_SLUGS: tuple[str, ...] = (
    "sun-field-hierarchy",
    "sun-level-hierarchy",
    "sun-field-hierarchy-level-1",
    "sun-field-hierarchy-level-2",
    "sun-field-hierarchy-level-3",
    "sun-level-hierarchy-level-2",
    "sun-level-hierarchy-level-3",
    "sni-hierarchy",
    "sni-level-1",
    "sni-level-2",
    "sni-level-3",
    "sni-level-4",
    "sni-level-5",
    "ssyk-level-4-groups-with-related-occupations",
    "the-ssyk-hierarchy-with-occupations",
    "ssyk-level-4-with-related-isco-level-4-groups",
)

_JSON_HREF_RE = re.compile(
    r'href=["\']([^"\']+\.json(?:\?[^"\']*)?)["\']', re.IGNORECASE
)


def _resolve_json_url(page_html: str, page_url: str) -> str | None:
    matches = _JSON_HREF_RE.findall(page_html)
    if not matches:
        return None
    href = matches[0]
    if href.startswith("http://") or href.startswith("https://"):
        return href
    base = page_url if page_url.endswith("/") else page_url + "/"
    return urljoin(base, href)


async def download_static_dataset(
    client: httpx.AsyncClient, slug: str, target_dir: Path
) -> Path | None:
    """Skrapar dataset-sidan, plockar ut JSON-URL:en och laddar ner filen."""
    page_url = f"{DATASET_PORTAL_BASE}/{slug}/"
    try:
        page = await request_with_retry(client, "GET", page_url)
    except Exception as exc:
        log.error("dataset.page.failed", slug=slug, fel=str(exc))
        return None

    json_url = _resolve_json_url(page.text, page_url)
    if not json_url:
        log.error("dataset.json_link.missing", slug=slug, page_url=page_url)
        return None

    try:
        payload = await request_with_retry(client, "GET", json_url)
    except Exception as exc:
        log.error("dataset.download.failed", slug=slug, url=json_url, fel=str(exc))
        return None

    target = target_dir / f"{slug}.json"
    target.write_bytes(payload.content)
    log.info(
        "dataset.download.ok",
        slug=slug,
        url=json_url,
        bytes=len(payload.content),
        path=str(target),
    )
    return target


async def download_all_static_datasets(
    client: httpx.AsyncClient, target_dir: Path
) -> list[Path]:
    target_dir.mkdir(parents=True, exist_ok=True)
    paths: list[Path] = []
    for slug in DATASET_SLUGS:
        result = await download_static_dataset(client, slug, target_dir)
        if result is not None:
            paths.append(result)
    log.info(
        "datasets.summary",
        attempted=len(DATASET_SLUGS),
        downloaded=len(paths),
        failed=len(DATASET_SLUGS) - len(paths),
    )
    return paths
