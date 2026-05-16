"""Extraherar efterfrågedata från SCB."""
import httpx
import os

SCB_API_BASE = os.environ.get("SCB_API_BASE", "https://statistikdatabasen.scb.se/api/v2")
LAN_KOD = os.environ.get("JONKOPING_LAN_CODE", "06")


async def extract_demand(sektor: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.get(f"{SCB_API_BASE}/sv/AM/AM0208",
                               params={"lan": LAN_KOD, "sektor": sektor})
        if res.status_code == 404:
            return {}
        res.raise_for_status()
        return res.json()
