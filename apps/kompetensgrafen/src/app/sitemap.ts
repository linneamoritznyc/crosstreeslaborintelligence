import type { MetadataRoute } from "next";

const BASE = "https://kompetensgrafen.crosstrees.se";
const SEKTORER = ["industri", "vard", "it", "bygg", "logistik", "service", "utbildning"];
const NOW = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,                  lastModified: NOW, changeFrequency: "daily",  priority: 1.0 },
    { url: `${BASE}/omstallning`, lastModified: NOW, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/roi`,         lastModified: NOW, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/chatt`,       lastModified: NOW, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/export`,      lastModified: NOW, changeFrequency: "weekly", priority: 0.5 },
    ...SEKTORER.map(s => ({
      url: `${BASE}/analys/${s}`,
      lastModified: NOW,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];
}
