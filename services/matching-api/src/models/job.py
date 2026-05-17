from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

# Rollen en kompetens har i en jobbannons — viktningarna 0.60/0.30/0.10
# tillämpas i services/fit_score.py. Inga andra värden tillåtna.
JobSkillRole = Literal["required", "preferred", "bonus"]


class JobSkillRef(BaseModel):
    """Referens från en jobbannons till en kompetens i AF-taxonomin."""

    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    skill_id: str = Field(..., min_length=1, description="AF concept_id för kompetens")
    role: JobSkillRole
    label: str | None = Field(
        default=None, description="Kompetensnamn så som det förekommer i annonsen"
    )


class Job(BaseModel):
    """Jobbannons från Platsbanken (jobsearch.api.jobtechdev.se).

    Inga härledda fält fabriceras — saknas data i källan är fältet None.
    """

    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    id: str = Field(..., min_length=1, description="AF annons-ID")
    title: str = Field(..., min_length=1)
    employer: str = Field(..., min_length=1)
    description: str | None = None
    municipality: str | None = Field(default=None, description="Kommunnamn på svenska")
    municipality_code: str | None = Field(default=None, description="SCB kommunkod, fyrsiffrig")
    occupation_id: str | None = Field(default=None, description="AF yrkes-concept_id")
    published_at: datetime | None = None
    application_deadline: datetime | None = None
    skills: list[JobSkillRef] = Field(default_factory=list)
    source_url: HttpUrl | None = Field(default=None, description="Direktlänk till annonsen")


class JobSummary(BaseModel):
    """Lättviktsversion för listningar och träfflistor."""

    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    id: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    employer: str = Field(..., min_length=1)
    municipality: str | None = None
    published_at: datetime | None = None
