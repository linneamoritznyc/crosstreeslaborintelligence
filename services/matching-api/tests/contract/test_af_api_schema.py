import pytest
import httpx
import os


AF_JOBSEARCH_URL = os.environ.get("AF_JOBSEARCH_URL", "https://jobsearch.api.jobtechdev.se")
AF_TAXONOMY_URL = os.environ.get("AF_TAXONOMY_URL", "https://taxonomy.api.jobtechdev.se")


@pytest.mark.asyncio
async def test_jobsearch_search_returns_hits():
    async with httpx.AsyncClient(timeout=15) as client:
        res = await client.get(f"{AF_JOBSEARCH_URL}/search", params={"q": "mjukvaruutvecklare", "limit": 1})
    assert res.status_code == 200
    data = res.json()
    assert "hits" in data, f"Saknat fält 'hits' i svar: {list(data.keys())}"


@pytest.mark.asyncio
async def test_taxonomy_concepts_schema():
    async with httpx.AsyncClient(timeout=15) as client:
        res = await client.get(f"{AF_TAXONOMY_URL}/v1/taxonomy/main/concepts",
                               params={"filter": "ingenjör", "limit": 1})
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list), f"Förväntat lista, fick: {type(data)}"
