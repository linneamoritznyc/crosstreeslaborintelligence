"""Extraherar utbildningsdata från Jobed Connect."""
import httpx
import os

AF_JOBED_URL = os.environ.get("AF_JOBED_URL", "https://jobed-connect.api.jobtechdev.se")


async def extract_education(occupation_id: str) -> list[dict]:
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.get(f"{AF_JOBED_URL}/jobbed/education",
                               params={"occupation_concept_id": occupation_id})
        if res.status_code == 404:
            return []
        res.raise_for_status()
        return res.json()
