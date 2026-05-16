import anthropic
import os

_client = anthropic.AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))
_MODEL = os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-6")

_SYSTEM = (
    "Du är en AI-rådgivare för Kompetensrådet i Jönköpings län. "
    "Du svarar på svenska och hjälper regionala beslutsfattare med arbetsmarknadsfrågor. "
    "Du baserar dina svar på aktuell data om Jönköpings läns arbetsmarknad. "
    "Var konkret och faktabaserad. Undvik spekulationer utan datastöd."
)


async def send_message(messages: list[dict]) -> str:
    formatted = [
        {"role": m["role"], "content": m["content"]}
        for m in messages
        if m.get("role") in ("user", "assistant")
    ]

    response = await _client.messages.create(
        model=_MODEL,
        max_tokens=2048,
        system=_SYSTEM,
        messages=formatted,
    )

    return response.content[0].text if response.content else ""
