from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

# 60 förfrågningar per minut per klient-IP — enligt
# OPTIMIZED_CODEBASE_GUIDELINES.md ("Säkerhet: Rate limiting").
DEFAULT_LIMIT = "60/minute"

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[DEFAULT_LIMIT],
    headers_enabled=True,
)


def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Returnerar 429 med svenskt felmeddelande vid överskriden gräns."""
    return JSONResponse(
        status_code=429,
        content={
            "fel": "För många förfrågningar",
            "detalj": f"Gränsen är {DEFAULT_LIMIT} per IP-adress",
        },
    )
