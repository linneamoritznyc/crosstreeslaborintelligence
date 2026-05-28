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
    subhead: "Var saknas det personal? Vem kan tränas om dit? Vad kostar det regionen?",
  },
  industri: {
    namn: "Tillverkning & industri",
    rustWord: "INDUSTRI",
    h1Parts: ["TILLVERKNING &", "INDUSTRI"],
    subhead: "Var saknas det personal? Vem kan tränas om dit? Vad kostar det regionen?",
  },
  bygg: {
    namn: "Bygg & anläggning",
    rustWord: "ANLÄGGNING",
    h1Parts: ["BYGG &", "ANLÄGGNING"],
    subhead: "Var saknas det personal? Vem kan tränas om dit? Vad kostar det regionen?",
  },
  it: {
    namn: "IT & digitalisering",
    rustWord: "DIGITALISERING",
    h1Parts: ["IT &", "DIGITALISERING"],
    subhead: "Var saknas det personal? Vem kan tränas om dit? Vad kostar det regionen?",
  },
  logistik: {
    namn: "Logistik & transport",
    rustWord: "TRANSPORT",
    h1Parts: ["LOGISTIK &", "TRANSPORT"],
    subhead: "Var saknas det personal? Vem kan tränas om dit? Vad kostar det regionen?",
  },
  service: {
    namn: "Service & handel",
    rustWord: "HANDEL",
    h1Parts: ["SERVICE &", "HANDEL"],
    subhead: "Var saknas det personal? Vem kan tränas om dit? Vad kostar det regionen?",
  },
  utbildning: {
    namn: "Utbildning",
    rustWord: "UTBILDNING",
    h1Parts: ["UTBILDNING"],
    subhead: "Var saknas det personal? Vem kan tränas om dit? Vad kostar det regionen?",
  },
};
