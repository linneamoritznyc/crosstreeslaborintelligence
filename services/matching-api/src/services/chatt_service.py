"""AI-chatt för Kompetensrådet — kontextinjektion + obligatoriska AI Act-fraser.

Obligatoriska inlednings- och avslutningsfraser läggs på varje svar (AI Act
Artikel 50 + interna riktlinjer för Kompetensrådet).
"""
from __future__ import annotations

import os

import anthropic

_MODEL = os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-6")

_SYSTEM = (
    "Du är Crosstrees kompetensanalysverktyg för Kompetensrådet i Jönköpings län. "
    "Du svarar alltid på svenska. "
    "Du svarar enbart baserat på data du har i kontexten. "
    "Om du saknar data för en fråga, säg exakt det. "
    "Hänvisa alltid till datakälla i ditt svar. "
    "Använd konkreta siffror, aldrig uppskattningar utan grund."
)

_OBLIGATORISK_INLEDNING = "Som AI-system analyserar jag följande data: AF Platsbanken, AF Substitutabilitetsdata, SCB-statistik."
_OBLIGATORISK_AVSLUTNING = (
    "Detta är en AI-genererad analys. Beslut fattas av ansvarig handläggare vid Kompetensrådet."
)


def _client() -> anthropic.AsyncAnthropic | None:
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not key:
        return None
    return anthropic.AsyncAnthropic(api_key=key)


async def send_message(messages: list[dict]) -> str:
    client = _client()
    if client is None:
        return (
            f"{_OBLIGATORISK_INLEDNING}\n\n"
            "AI-analys tillfälligt otillgänglig (Anthropic API ej konfigurerad). "
            "Försök om några minuter eller kontakta administratör.\n\n"
            f"{_OBLIGATORISK_AVSLUTNING}"
        )

    formatted = [
        {"role": m["role"], "content": m["content"]}
        for m in messages
        if m.get("role") in ("user", "assistant")
    ]

    try:
        response = await client.messages.create(
            model=_MODEL,
            max_tokens=2048,
            system=_SYSTEM,
            messages=formatted,
        )
        raw = response.content[0].text if response.content else ""
    except Exception:
        return (
            f"{_OBLIGATORISK_INLEDNING}\n\n"
            "AI-analys tillfälligt otillgänglig — tjänsten svarade inte. Försök igen.\n\n"
            f"{_OBLIGATORISK_AVSLUTNING}"
        )

    return f"{_OBLIGATORISK_INLEDNING}\n\n{raw}\n\n{_OBLIGATORISK_AVSLUTNING}"
