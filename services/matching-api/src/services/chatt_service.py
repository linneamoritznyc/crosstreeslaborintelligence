"""AI-rådgivare för Kompetensrådet.

Uppfyller EU AI Act Artikel 50 (transparenskrav för interaktiva AI-system)
genom obligatoriska inlednings- och avslutningsfraser i varje svar.
Streaming via Server-Sent Events enligt PRD KR-07.
"""
import os
from typing import AsyncIterator

import anthropic

from ..middleware.logging import get_logger

log = get_logger(__name__)

_client = anthropic.AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))
_MODEL = os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-6")

_SYSTEM = """Du är Crosstrees kompetensanalysverktyg för Kompetensrådet i Jönköpings län.

REGLER:
- Du svarar alltid på svenska.
- Du svarar enbart baserat på data du har i kontexten.
- Om du saknar data för en fråga, säg exakt det — gissa aldrig.
- Hänvisa alltid till datakälla i ditt svar.
- Använd konkreta siffror, aldrig uppskattningar utan grund.

OBLIGATORISK STRUKTUR på varje svar (krav enligt EU AI Act Artikel 50):
1. Inled alltid med: "Som AI-system analyserar jag följande data: [lista källor du har]"
2. Avsluta alltid med: "Detta är en AI-genererad analys. Beslut fattas av ansvarig handläggare vid Kompetensrådet."

Mellan inledning och avslutning ger du själva sakanalysen — konkret, faktabaserad,
med tydliga siffror och källhänvisningar."""


def _format_context(context: dict | None) -> str:
    """Bygger datakontext-injektion enligt PRD KR-08."""
    if not context:
        return ""
    lines = ["DATAKONTEXT (använd endast detta i ditt svar):"]
    for key, value in context.items():
        lines.append(f"- {key}: {value}")
    return "\n".join(lines)


async def send_message(messages: list[dict], context: dict | None = None) -> str:
    formatted = [
        {"role": m["role"], "content": m["content"]}
        for m in messages
        if m.get("role") in ("user", "assistant")
    ]

    system_prompt = _SYSTEM
    if context:
        system_prompt = f"{_SYSTEM}\n\n{_format_context(context)}"

    response = await _client.messages.create(
        model=_MODEL,
        max_tokens=2048,
        system=system_prompt,
        messages=formatted,
    )

    log.info(
        "chatt.completed",
        message_count=len(formatted),
        context_keys=list(context.keys()) if context else [],
    )

    return response.content[0].text if response.content else ""


async def stream_message(
    messages: list[dict], context: dict | None = None
) -> AsyncIterator[str]:
    """Strömmar svaret som SSE-event enligt PRD KR-07."""
    formatted = [
        {"role": m["role"], "content": m["content"]}
        for m in messages
        if m.get("role") in ("user", "assistant")
    ]

    system_prompt = _SYSTEM
    if context:
        system_prompt = f"{_SYSTEM}\n\n{_format_context(context)}"

    async with _client.messages.stream(
        model=_MODEL,
        max_tokens=2048,
        system=system_prompt,
        messages=formatted,
    ) as stream:
        async for chunk in stream.text_stream:
            yield chunk

    log.info(
        "chatt.stream.completed",
        message_count=len(formatted),
        context_keys=list(context.keys()) if context else [],
    )
