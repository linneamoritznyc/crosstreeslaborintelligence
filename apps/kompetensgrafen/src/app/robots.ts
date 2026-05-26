import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: "https://kompetensgrafen.crosstrees.se/sitemap.xml",
    host: "https://kompetensgrafen.crosstrees.se",
  };
}
