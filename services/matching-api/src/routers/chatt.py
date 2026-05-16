from fastapi import APIRouter
from pydantic import BaseModel
from ..services.chatt_service import send_message

router = APIRouter()


class ChattRequest(BaseModel):
    messages: list[dict]


@router.post("/")
async def chatt(request: ChattRequest):
    content = await send_message(request.messages)
    return {"content": content}
