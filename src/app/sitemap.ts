import type { MetadataRoute } from "next";

const productionUrl = "https://conyva.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: productionUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${productionUrl}/vi`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${productionUrl}/en`, lastModified, changeFrequency: "weekly", priority: 0.9 },
  ];
}
