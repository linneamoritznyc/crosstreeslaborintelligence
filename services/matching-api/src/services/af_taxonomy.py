import httpx
import os

_BASE = os.environ.get("AF_TAXONOMY_URL", "https://taxonomy.api.jobtechdev.se")


async def get_occupation(query: str) -> list[dict]:
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{_BASE}/v1/taxonomy/main/concepts", params={"filter": query})
        res.raise_for_status()
        return res.json()


async def get_skills(query: str) -> list[dict]:
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{_BASE}/v1/taxonomy/main/concepts",
                               params={"filter": query, "type": "skill"})
        res.raise_for_status()
        return res.json()
