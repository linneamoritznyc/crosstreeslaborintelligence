"""Extraherar yrkestaxonomi från Arbetsförmedlingens taxonomi-API."""
import httpx
import json
import os
from pathlib import Path

AF_TAXONOMY_URL = os.environ.get("AF_TAXONOMY_URL", "https://taxonomy.api.jobtechdev.se")
_SEED = Path(__file__).parent.parent.parent / "seed"


async def extract_taxonomy() -> list[dict]:
    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.get(f"{AF_TAXONOMY_URL}/v1/taxonomy/main/concepts",
                               params={"type": "occupation-name", "limit": 1000})
        res.raise_for_status()
        return res.json()


if __name__ == "__main__":
    import asyncio
    data = asyncio.run(extract_taxonomy())
    (_SEED / "occupations_seed.json").write_text(json.dumps(data, ensure_ascii=False, indent=2))
    print(f"Extraherade {len(data)} yrken")
