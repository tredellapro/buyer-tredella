import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { getSubcategoryLinks } from "@/data/products";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tredella.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/wholesale`, changeFrequency: "daily", priority: 0.9 },
  ];

  for (const cat of categories) {
    const subs = getSubcategoryLinks(cat.slug);
    if (subs.length === 0) continue;
    entries.push(
      {
        url: `${SITE_URL}/${cat.slug}`,
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/wholesale/${cat.slug}`,
        changeFrequency: "weekly",
        priority: 0.8,
      }
    );
    for (const sub of subs) {
      entries.push(
        {
          url: `${SITE_URL}/${cat.slug}/${sub.slug}`,
          changeFrequency: "weekly",
          priority: 0.7,
        },
        {
          url: `${SITE_URL}/wholesale/${cat.slug}/${sub.slug}`,
          changeFrequency: "weekly",
          priority: 0.7,
        }
      );
    }
  }

  return entries;
}
