from fastapi import APIRouter, UploadFile, File
from ..services.cv_parser import parse_cv
from ..services.embeddings import store_session_skills
from ..services.cache import redis_client, CV_PARSE_TTL
import uuid

router = APIRouter()


@router.post("/parse")
async def upload_cv(file: UploadFile = File(...)):
    contents = await file.read()
    skill_ids = await parse_cv(contents, file.filename or "")
    session_id = str(uuid.uuid4())
    await store_session_skills(session_id, skill_ids)
    return {"session_id": session_id, "skill_count": len(skill_ids)}
