"""CV-uppladdning och kompetensextraktion.

Loggar alla AI-inferensanrop för EU AI Act Artikel 12 (6 månaders retention).
Session-ID returneras till klienten för vidare matchning.
"""
from __future__ import annotations

import uuid

from fastapi import APIRouter, UploadFile, File, HTTPException

from ..middleware.logging import get_logger
from ..services.cache import redis_client, CV_PARSE_TTL, AI_ACT_LOG_RETENTION
from ..services.cv_parser import parse_cv
from ..services.embeddings import store_session_skills, get_session_skill_ids

log = get_logger(__name__)
router = APIRouter()

_MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/parse")
async def upload_cv(file: UploadFile = File(...)):
    """Tar emot CV, extraherar kompetenser via Claude och returnerar session-ID."""
    contents = await file.read()

    if len(contents) > _MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Filen är för stor (max 5 MB)")

    session_id = str(uuid.uuid4())
    skill_ids = await parse_cv(contents, file.filename or "")

    await store_session_skills(session_id, skill_ids)

    # EU AI Act Artikel 12 — logga varje AI-inferensanrop med session-ID
    log.info(
        "cv.parse.ai_act_log",
        session_id=session_id,
        filename=file.filename,
        skill_count=len(skill_ids),
        retention_seconds=AI_ACT_LOG_RETENTION,
    )

    return {"session_id": session_id, "skill_count": len(skill_ids)}


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Returnerar de extraherade kompetenserna för en CV-session.

    Används av medborgar-UI:t för att låta användaren verifiera vad systemet
    läste från CV:t innan matchning körs. Returnerar 404 om sessionen
    inte finns (24 h-TTL har gått ut) eller om Redis-fallbacken tappat den
    vid container-restart.
    """
    skills = await get_session_skill_ids(session_id)
    if not skills:
        raise HTTPException(
            status_code=404,
            detail="Session saknas eller har gått ut (24 h-TTL)",
        )
    return {"session_id": session_id, "skills": skills, "skill_count": len(skills)}
