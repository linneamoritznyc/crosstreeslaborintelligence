import anthropic
import os
import json

_client = anthropic.AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))
_MODEL = os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-6")


async def parse_cv(contents: bytes, filename: str) -> list[str]:
    text = contents.decode("utf-8", errors="replace")[:8000]

    message = await _client.messages.create(
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

    raw = message.content[0].text if message.content else "[]"
    try:
        skills = json.loads(raw)
        return [str(s) for s in skills if isinstance(s, str)]
    except json.JSONDecodeError:
        return []
