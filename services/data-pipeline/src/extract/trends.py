"""Extraherar trenddata om yrken och kompetenser."""
import httpx
import os

AF_JOBSEARCH_URL = os.environ.get("AF_JOBSEARCH_URL", "https://jobsearch.api.jobtechdev.se")


async def extract_occupation_trends(occupation_query: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.get(f"{AF_JOBSEARCH_URL}/complete",
                               params={"q": occupation_query, "type": "occupation"})
        res.raise_for_status()
        return res.json()
