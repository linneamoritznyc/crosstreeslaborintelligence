from pydantic import BaseModel


class Skill(BaseModel):
    id: str
    name: str
    type: str | None = None
    idf_weight: float = 1.0
