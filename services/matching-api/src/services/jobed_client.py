import httpx
import os

_BASE = os.environ.get("AF_JOBED_URL", "https://jobed-connect.api.jobtechdev.se")


async def get_education_suggestions(occupation_id: str, lan_kod: str) -> list[dict]:
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{_BASE}/jobbed/education",
            params={"occupation_concept_id": occupation_id, "region": lan_kod},
        )
        res.raise_for_status()
        return res.json()
