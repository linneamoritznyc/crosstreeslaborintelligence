"""CV-tolkning via Anthropic Claude.

Stöder PDF (via pypdf) och DOCX (via docx2txt) samt rå textinmatning.
EU AI Act Artikel 12: varje inferensanrop loggas i strukturerad form;
CV-innehåll lagras aldrig persistent.
"""
from __future__ import annotations

import io
import json
import os

import anthropic

from ..middleware.logging import get_logger

log = get_logger(__name__)

_client = anthropic.AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))
_MODEL = os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-6")
_MAX_TEXT_CHARS = 12_000


def _extract_pdf_text(contents: bytes) -> str:
    try:
        from pypdf import PdfReader
    except ImportError:
        log.warning("cv_parser.pypdf_missing")
        return contents.decode("utf-8", errors="replace")
    try:
        reader = PdfReader(io.BytesIO(contents))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages)
    except Exception as exc:  # noqa: BLE001
        log.warning("cv_parser.pdf_extract_failed", error=str(exc))
        return ""


def _extract_docx_text(contents: bytes) -> str:
    try:
        import docx2txt
    except ImportError:
        log.warning("cv_parser.docx2txt_missing")
        return contents.decode("utf-8", errors="replace")
    try:
        return docx2txt.process(io.BytesIO(contents)) or ""
    except Exception as exc:  # noqa: BLE001
        log.warning("cv_parser.docx_extract_failed", error=str(exc))
        return ""


def _extract_text(contents: bytes, filename: str) -> str:
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return _extract_pdf_text(contents)
    if lower.endswith(".docx"):
        return _extract_docx_text(contents)
    return contents.decode("utf-8", errors="replace")


async def parse_cv(contents: bytes, filename: str) -> list[str]:
    """Extraherar yrkeskompetenser ur ett CV via Claude.

    Returnerar en lista med kompetensnamn (strängar). CV-text loggas aldrig.
    """
    text = _extract_text(contents, filename)[:_MAX_TEXT_CHARS]
    if not text.strip():
        log.info("cv_parser.empty_text", filename=filename)
        return []

    message = await _client.messages.create(
        model=_MODEL,
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": (
                    "Du är ett system som extraherar yrkeskompetenser från CV:n. "
                    "Extrahera alla professionella kompetenser (tekniska, språk, "
                    "verktyg, programmeringsspråk, mjuka kompetenser) och returnera "
                    "dem som en JSON-lista med strängar på svenska. "
                    "Returnera ENBART giltig JSON, inget annat.\n\nCV:\n" + text
                ),
            }
        ],
    )

    raw = message.content[0].text if message.content else "[]"
    try:
        # Robusta mot Claude som ibland lägger till markdown ```json-block
        if "```" in raw:
            parts = raw.split("```")
            for part in parts:
                stripped = part.strip()
                if stripped.startswith("json"):
                    raw = stripped[4:].strip()
                    break
                elif stripped.startswith("["):
                    raw = stripped
                    break
        skills = json.loads(raw)
        result = [str(s).strip() for s in skills if isinstance(s, str) and s.strip()]
        log.info(
            "cv_parser.success",
            filename=filename,
            text_length=len(text),
            skill_count=len(result),
        )
        return result
    except json.JSONDecodeError as exc:
        log.warning("cv_parser.json_decode_failed", error=str(exc))
        return []
