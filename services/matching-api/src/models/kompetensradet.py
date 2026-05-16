from pydantic import BaseModel


class BristYrke(BaseModel):
    occupation_id: str
    occupation_name: str
    brist_index: float
    antal_annonser: int
    prognos: str


class ROIResultat(BaseModel):
    roi_procent: float
    payback_manader: int
    netto_vinst_kr: float
    antaganden: list[str]
