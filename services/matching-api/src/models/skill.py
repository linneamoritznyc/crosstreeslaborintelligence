from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

# Tekniska taxonomityper enligt AF (knowledge/skill/language) — engelska
# eftersom AF-taxonomin använder engelska för dessa interna kategorier.
SkillType = Literal["knowledge", "skill", "language", "tool", "unknown"]


class Skill(BaseModel):
    """Kompetens från Arbetsförmedlingens taxonomi.

    idf_weight beräknas av data-pipeline ur historiska annonser
    (Jobtech Historical). Aldrig hårdkodade default-vikter — saknas
    värdet sätts None och konsument måste hantera frånvaron.
    """

    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    id: str = Field(..., min_length=1, description="AF concept_id")
    name: str = Field(..., min_length=1, description="Kompetensnamn (svenska)")
    type: SkillType = Field(default="unknown")
    idf_weight: float | None = Field(
        default=None,
        ge=0.0,
        description="Inverse document frequency, beräknad från historiska annonser",
    )
    last_synced_at: datetime | None = None


class SkillSummary(BaseModel):
    """Lättviktsversion för listningar och autocomplete."""

    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    type: SkillType = "unknown"
