from fastapi import APIRouter
import os

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "algorithm_version": os.environ.get("ALGORITHM_VERSION", "okänd"),
    }
