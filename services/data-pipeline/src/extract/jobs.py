"""Extraherar jobbannonser från Platsbanken."""
import httpx
import os

AF_JOBSEARCH_URL = os.environ.get("AF_JOBSEARCH_URL", "https://jobsearch.api.jobtechdev.se")


async def extract_jobs(query: str = "", limit: int = 100) -> list[dict]:
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.get(f"{AF_JOBSEARCH_URL}/search",
                               params={"q": query, "limit": limit})
        res.raise_for_status()
        return res.json().get("hits", [])


if __name__ == "__main__":
    import asyncio
    jobs = asyncio.run(extract_jobs())
    print(f"Extraherade {len(jobs)} annonser")
