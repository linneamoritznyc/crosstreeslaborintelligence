"""Chatt-router med SSE-streaming.

PRD KR-07: streaming via Server-Sent Events.
PRD KR-08: kontextinjektion av reell data.
AI Act Artikel 50: obligatoriska fraser hanteras i chatt_service.
"""
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from ..services.chatt_service import send_message, stream_message

router = APIRouter()


class ChattMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class ChattRequest(BaseModel):
    messages: list[ChattMessage]
    context: dict | None = None


@router.post("/")
async def chatt(request: ChattRequest) -> dict:
    msgs = [m.model_dump() for m in request.messages]
    content = await send_message(msgs, context=request.context)
    return {"content": content}


@router.post("/stream")
async def chatt_stream(request: ChattRequest) -> StreamingResponse:
    """Server-Sent Events-stream för chattsvar."""
    msgs = [m.model_dump() for m in request.messages]

    async def event_generator():
        try:
            async for chunk in stream_message(msgs, context=request.context):
                escaped = chunk.replace("\n", "\\n")
                yield f"data: {escaped}\n\n"
            yield "event: done\ndata: \n\n"
        except Exception as exc:  # noqa: BLE001
            yield f"event: error\ndata: {str(exc)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
