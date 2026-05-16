import httpx
import os

_BASE = os.environ.get("AF_JOBSEARCH_URL", "https://jobsearch.api.jobtechdev.se")


async def get_trends(sektor: str) -> dict:
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{_BASE}/complete", params={"q": sektor, "type": "occupation"})
        res.raise_for_status()
        return res.json()
