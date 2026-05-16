export interface BristYrke {
  occupation_id: string;
  occupation_name: string;
  brist_index: number;
  antal_annonser: number;
  prognos: "ökande" | "stabil" | "minskande";
}

export interface ROIResultat {
  roi_procent: number;
  payback_manader: number;
  netto_vinst_kr: number;
  antaganden: string[];
}
