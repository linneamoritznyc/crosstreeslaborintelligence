"""CV-parsing via Anthropic Claude.

Returnerar tom lista om Anthropic-nyckel saknas — UI degraderar gracefully
enligt degraderingsmatrisen i Codebase Guidelines sektion 6.
"""
from __future__ import annotations

import json
import os

import anthropic

_MODEL = os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-6")


def _client() -> anthropic.AsyncAnthropic | None:
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not key:
        return None
    return anthropic.AsyncAnthropic(api_key=key)


class SystemUnconfiguredError(Exception):
    """Kastad när Anthropic-nyckeln saknas — frontend visar degraderat tillstånd."""


async def parse_cv(contents: bytes, filename: str) -> list[str]:
    client = _client()
    if client is None:
        raise SystemUnconfiguredError(
            "ANTHROPIC_API_KEY är inte konfigurerat — systemet kan inte läsa CV just nu."
        )

    text = contents.decode("utf-8", errors="replace")[:8000]

    try:
        message = await client.messages.create(
            model=_MODEL,
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": (
                        "Du är ett system som extraherar yrkeskompetenser från CV:n. "
                        "Extrahera alla kompetenser och returnera dem som en JSON-lista med strängar. "
                        "Returnera ENBART giltig JSON, inget annat.\n\nCV:\n" + text
                    ),
                }
            ],
        )
    except Exception:
        return []

    raw = message.content[0].text if message.content else "[]"
    try:
        skills = json.loads(raw)
        return [str(s) for s in skills if isinstance(s, str)]
    except json.JSONDecodeError:
        return []
