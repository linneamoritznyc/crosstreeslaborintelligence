import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const SEKTORER = ["industri", "vard", "it", "bygg", "logistik", "service", "utbildning"];
const NOW = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return [
    { url: base,                    lastModified: NOW, changeFrequency: "daily",  priority: 1.0 },
    { url: `${base}/omstallning`,   lastModified: NOW, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/roi`,           lastModified: NOW, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/chatt`,         lastModified: NOW, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/export`,        lastModified: NOW, changeFrequency: "weekly", priority: 0.5 },
    ...SEKTORER.map(s => ({
      url: `${base}/analys/${s}`,
      lastModified: NOW,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];
}
