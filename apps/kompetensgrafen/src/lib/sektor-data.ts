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
    subhead: "Bristkarta, substitutabilitetsanalys och ROI-kalkyl. Live-data från AF Platsbanken och ESCO-taxonomin.",
  },
  industri: {
    namn: "Tillverkning & industri",
    rustWord: "INDUSTRI",
    h1Parts: ["TILLVERKNING &", "INDUSTRI"],
    subhead: "Bristkarta, substitutabilitetsanalys och ROI-kalkyl. Live-data från AF Platsbanken och ESCO-taxonomin.",
  },
  bygg: {
    namn: "Bygg & anläggning",
    rustWord: "ANLÄGGNING",
    h1Parts: ["BYGG &", "ANLÄGGNING"],
    subhead: "Bristkarta, substitutabilitetsanalys och ROI-kalkyl. Live-data från AF Platsbanken och ESCO-taxonomin.",
  },
  it: {
    namn: "IT & digitalisering",
    rustWord: "DIGITALISERING",
    h1Parts: ["IT &", "DIGITALISERING"],
    subhead: "Bristkarta, substitutabilitetsanalys och ROI-kalkyl. Live-data från AF Platsbanken och ESCO-taxonomin.",
  },
  logistik: {
    namn: "Logistik & transport",
    rustWord: "TRANSPORT",
    h1Parts: ["LOGISTIK &", "TRANSPORT"],
    subhead: "Bristkarta, substitutabilitetsanalys och ROI-kalkyl. Live-data från AF Platsbanken och ESCO-taxonomin.",
  },
  service: {
    namn: "Service & handel",
    rustWord: "HANDEL",
    h1Parts: ["SERVICE &", "HANDEL"],
    subhead: "Bristkarta, substitutabilitetsanalys och ROI-kalkyl. Live-data från AF Platsbanken och ESCO-taxonomin.",
  },
  utbildning: {
    namn: "Utbildning",
    rustWord: "UTBILDNING",
    h1Parts: ["UTBILDNING"],
    subhead: "Bristkarta, substitutabilitetsanalys och ROI-kalkyl. Live-data från AF Platsbanken och ESCO-taxonomin.",
  },
};
