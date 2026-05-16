import httpx
import os
from typing import Any

_BASE = os.environ.get("AF_JOBSEARCH_URL", "https://jobsearch.api.jobtechdev.se")


async def search_jobs(q: str) -> list[dict]:
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{_BASE}/search", params={"q": q, "limit": 20})
        res.raise_for_status()
        data = res.json()
        return data.get("hits", [])


async def get_job_detail(job_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{_BASE}/ad/{job_id}")
        res.raise_for_status()
        return res.json()


async def get_job_skill_ids(skill_ids: list[str]) -> list[dict]:
    async with httpx.AsyncClient() as client:
        params = [("skills", s) for s in skill_ids] + [("limit", "10")]
        res = await client.get(f"{_BASE}/search", params=params)
        res.raise_for_status()
        return res.json().get("hits", [])


async def get_job_idf(job_id: str) -> tuple[dict[str, str], dict[str, float]]:
    detail = await get_job_detail(job_id)
    must_skills = {s["concept_id"]: "required" for s in detail.get("must_have", {}).get("skills", [])}
    nice_skills = {s["concept_id"]: "preferred" for s in detail.get("nice_to_have", {}).get("skills", [])}
    job_skills = {**must_skills, **nice_skills}
    idf: dict[str, float] = {k: 1.0 for k in job_skills}
    return job_skills, idf
