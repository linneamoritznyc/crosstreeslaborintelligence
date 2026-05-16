import httpx
import os

_BASE = os.environ.get("AF_ENRICHMENTS_URL", "https://jobad-enrichments.api.jobtechdev.se")


async def enrich_job_ad(ad_text: str) -> dict:
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{_BASE}/enrich/ad", json={"text": ad_text})
        res.raise_for_status()
        return res.json()
