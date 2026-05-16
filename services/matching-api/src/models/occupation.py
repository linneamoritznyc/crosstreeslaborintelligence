from pydantic import BaseModel


class Occupation(BaseModel):
    id: str
    name: str
    ssyk_code: str | None = None
    description: str | None = None
