from pydantic import BaseModel


class Job(BaseModel):
    id: str
    title: str
    employer: str
    description: str | None = None
    municipality: str | None = None
    published_at: str | None = None
