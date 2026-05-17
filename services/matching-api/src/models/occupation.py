from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class Occupation(BaseModel):
    """Yrke från Arbetsförmedlingens taxonomi (concept_id-baserat).

    Källa: taxonomy.api.jobtechdev.se. Fältet ssyk_code följer SSYK-2012.
    """

    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    id: str = Field(..., min_length=1, description="AF concept_id")
    name: str = Field(..., min_length=1, description="Svenskt yrkesnamn (preferredLabel)")
    ssyk_code: str | None = Field(default=None, description="SSYK-2012-kod, fyrsiffrig")
    description: str | None = Field(default=None, description="Yrkesbeskrivning på svenska")
    parent_concept_id: str | None = Field(default=None, description="Överordnat yrkeskoncept")
    last_synced_at: datetime | None = Field(
        default=None, description="Senaste synk från AF-taxonomin"
    )


class OccupationSummary(BaseModel):
    """Lättviktsversion för listningar och autocomplete."""

    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    ssyk_code: str | None = None
