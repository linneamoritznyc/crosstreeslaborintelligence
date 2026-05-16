"""Extraherar historisk jobbannonsdata från Jobtech Historical."""
import httpx

_BASE = "https://historical.api.jobtechdev.se"


async def extract_historical(year: int) -> list[dict]:
    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.get(f"{_BASE}/search", params={"published-after": f"{year}-01-01",
                                                           "published-before": f"{year}-12-31",
                                                           "limit": 500})
        res.raise_for_status()
        return res.json().get("hits", [])
