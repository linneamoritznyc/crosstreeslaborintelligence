"""CV-uppladdning och kompetensextraktion.

Loggar alla AI-inferensanrop för EU AI Act Artikel 12 (6 månaders retention).
Session-ID returneras till klienten för vidare matchning.
"""
from __future__ import annotations

import json
import uuid

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ..middleware.logging import get_logger
from ..services.cache import redis_client, CV_PARSE_TTL, AI_ACT_LOG_RETENTION
from ..services.cv_parser import parse_cv, SystemUnconfiguredError
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
    try:
        skill_ids = await parse_cv(contents, file.filename or "")
    except SystemUnconfiguredError as e:
        raise HTTPException(status_code=503, detail=str(e))

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


@router.post("/parse-stream")
async def upload_cv_stream(file: UploadFile = File(...)):
    """SSE-ström: emitterar stegvisa händelser under CV-parsning.

    Händelseformat: data: <json>\\n\\n
    Steg: reading → extracting → parsing → esco → done (eller error)
    """
    contents = await file.read()
    filename = file.filename or ""

    if len(contents) > _MAX_FILE_SIZE:
        async def size_error():
            yield f"data: {json.dumps({'stage': 'error', 'code': 'size'})}\n\n"
        return StreamingResponse(size_error(), media_type="text/event-stream",
                                 headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

    async def generate():
        # Stage 1: reading the file
        yield f"data: {json.dumps({'stage': 'reading'})}\n\n"

        # Stage 2: decode text
        yield f"data: {json.dumps({'stage': 'extracting'})}\n\n"

        # Stage 3: Claude AI parsing (blocking, but emitted before the call)
        yield f"data: {json.dumps({'stage': 'parsing'})}\n\n"

        try:
            skill_ids = await parse_cv(contents, filename)
        except SystemUnconfiguredError:
            yield f"data: {json.dumps({'stage': 'error', 'code': 'unconfigured'})}\n\n"
            return

        # Stage 4: ESCO cross-reference / session store
        yield f"data: {json.dumps({'stage': 'esco'})}\n\n"

        if not skill_ids:
            yield f"data: {json.dumps({'stage': 'error', 'code': 'empty'})}\n\n"
            return

        session_id = str(uuid.uuid4())
        await store_session_skills(session_id, skill_ids)

        log.info(
            "cv.parse.ai_act_log",
            session_id=session_id,
            filename=filename,
            skill_count=len(skill_ids),
            retention_seconds=AI_ACT_LOG_RETENTION,
        )

        # Stage 5: done
        yield f"data: {json.dumps({'stage': 'done', 'session_id': session_id, 'skill_count': len(skill_ids)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Returnerar de extraherade kompetenserna för en CV-session."""
    skills = await get_session_skill_ids(session_id)
    if not skills:
        raise HTTPException(
            status_code=404,
            detail="Session saknas eller har gått ut (24 h-TTL)",
        )
    return {"session_id": session_id, "skills": skills, "skill_count": len(skills)}


class AddSkillsBody(BaseModel):
    skills: list[str]


@router.patch("/session/{session_id}/skills")
async def add_skills(session_id: str, body: AddSkillsBody):
    """Lägger till kompetenser i en befintlig session.

    Används när användaren manuellt lägger till kompetenser som AI:n missade.
    Dubbletter ignoreras (case-insensitive).
    """
    existing = await get_session_skill_ids(session_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Session saknas eller har gått ut (24 h-TTL)")

    existing_lower = {s.lower() for s in existing}
    added = [s for s in body.skills if s.strip() and s.strip().lower() not in existing_lower]
    merged = existing + [s.strip() for s in added]

    await store_session_skills(session_id, merged)
    log.info("cv.session.add_skills", session_id=session_id, added=len(added))

    return {"session_id": session_id, "skills": merged, "skill_count": len(merged), "added": len(added)}


@router.get("/session/{session_id}/log")
async def get_session_log(session_id: str):
    """EU AI Act Artikel 12 — transparens om vad som loggats om denna session.

    Returnerar vad systemet har registrerat, hur länge det bevaras och
    var ansvaret ligger. Ingen personuppgift utöver session-ID sparas.
    """
    skills = await get_session_skill_ids(session_id)
    if skills is None:
        raise HTTPException(status_code=404, detail="Session saknas eller har gått ut")

    return {
        "session_id": session_id,
        "logged_fields": [
            {"field": "session_id", "description": "Slumpmässigt UUID, ej kopplat till din identitet"},
            {"field": "filename", "description": "CV-filens namn (du angav det), loggas en gång vid uppladdning"},
            {"field": "skill_count", "description": "Antal kompetenser AI:n hittade"},
            {"field": "timestamp", "description": "Tidpunkt för uppladdning (UTC)"},
        ],
        "retention": {
            "session_skills": "24 timmar (Redis TTL) — raderas automatiskt",
            "ai_act_log": f"{AI_ACT_LOG_RETENTION // (3600 * 24 * 30)} månader — strukturerade loggar per EU AI Act art. 12",
        },
        "data_controller": "Crosstrees Labor Intelligence · Vetlanda · linnea.moritz@uni.minerva.edu",
        "ai_system": "Anthropic Claude (cv-parsing), Arbetsförmedlingens taxonomi-API (kompetensklassificering)",
        "your_rights": "Du har rätt att begära radering av loggposter. Kontakta datakontrollanten med ditt session-ID.",
        "no_personal_data": True,
        "current_skill_count": len(skills),
    }
