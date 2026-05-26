export interface SektorInfo {
  namn: string;
  rustWord: string;
  h1Parts: string[];
  subhead: string;
}

export const SEKTORER: Record<string, SektorInfo> = {
  vard: {
    namn: "Vård & omsorg",
    rustWord: "OMSORG",
    h1Parts: ["VÅRD &", "OMSORG"],
    subhead: "Steg 1 av 5. Välj kommun eller yrke nedan för att fortsätta till omställningsanalys, utbildningsgap och ROI.",
  },
  industri: {
    namn: "Tillverkning & industri",
    rustWord: "INDUSTRI",
    h1Parts: ["TILLVERKNING &", "INDUSTRI"],
    subhead: "Steg 1 av 5. Välj kommun eller yrke nedan för att fortsätta till omställningsanalys, utbildningsgap och ROI.",
  },
  bygg: {
    namn: "Bygg & anläggning",
    rustWord: "ANLÄGGNING",
    h1Parts: ["BYGG &", "ANLÄGGNING"],
    subhead: "Steg 1 av 5. Välj kommun eller yrke nedan för att fortsätta till omställningsanalys, utbildningsgap och ROI.",
  },
  it: {
    namn: "IT & digitalisering",
    rustWord: "DIGITALISERING",
    h1Parts: ["IT &", "DIGITALISERING"],
    subhead: "Steg 1 av 5. Välj kommun eller yrke nedan för att fortsätta till omställningsanalys, utbildningsgap och ROI.",
  },
  logistik: {
    namn: "Logistik & transport",
    rustWord: "TRANSPORT",
    h1Parts: ["LOGISTIK &", "TRANSPORT"],
    subhead: "Steg 1 av 5. Välj kommun eller yrke nedan för att fortsätta till omställningsanalys, utbildningsgap och ROI.",
  },
  service: {
    namn: "Service & handel",
    rustWord: "HANDEL",
    h1Parts: ["SERVICE &", "HANDEL"],
    subhead: "Steg 1 av 5. Välj kommun eller yrke nedan för att fortsätta till omställningsanalys, utbildningsgap och ROI.",
  },
  utbildning: {
    namn: "Utbildning",
    rustWord: "UTBILDNING",
    h1Parts: ["UTBILDNING"],
    subhead: "Steg 1 av 5. Välj kommun eller yrke nedan för att fortsätta till omställningsanalys, utbildningsgap och ROI.",
  },
};
