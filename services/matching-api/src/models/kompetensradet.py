from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

# Prognosbedömningar enligt SCB AM0208 — endast tre giltiga värden.
Prognos = Literal["ökande", "stabil", "minskande"]

# Sektorer som Kompetensrådet i Jönköpings län täcker.
Sektor = Literal["industri", "vård", "it", "bygg", "handel", "transport", "övrigt"]


class BristYrke(BaseModel):
    """Yrke med bristindex för en given sektor i Jönköpings län."""

    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    occupation_id: str = Field(..., min_length=1)
    occupation_name: str = Field(..., min_length=1)
    brist_index: float = Field(..., ge=0.0)
    antal_annonser: int = Field(..., ge=0)
    prognos: Prognos


class UtbildningsForslag(BaseModel):
    """Utbildning som föreslås för omställning eller kompetensutveckling."""

    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    titel: str = Field(..., min_length=1)
    leverantor: str = Field(..., min_length=1)
    url: HttpUrl | None = None
    veckor: int | None = Field(default=None, ge=0)


class OmstallningsYrke(BaseModel):
    """Yrke med hög substituerbarhet och rekommenderade omställningsspår."""

    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    occupation_id: str = Field(..., min_length=1)
    occupation_name: str = Field(..., min_length=1)
    substitutability_score: float = Field(..., ge=0.0, le=1.0)
    rekommenderade_utbildningar: list[UtbildningsForslag] = Field(default_factory=list)


class ROIResultat(BaseModel):
    """Resultat från ROI-kalkylator för utbildningsinsatser."""

    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    roi_procent: float
    payback_manader: int = Field(..., ge=0)
    netto_vinst_kr: float
    antaganden: list[str] = Field(..., min_length=1)


class KommunBristPunkt(BaseModel):
    """Punkt på länskartan: bristindex per kommun."""

    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    kommun_kod: str = Field(..., min_length=4, max_length=4)
    namn: str = Field(..., min_length=1)
    brist_index: float = Field(..., ge=0.0)
