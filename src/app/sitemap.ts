import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sabbah-de-babel.netlify.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.category.findMany({
      select: { slug: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/chroniques`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/culture`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/curiosites`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/a-propos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/chroniques/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE_URL}/chroniques/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...articleRoutes, ...categoryRoutes];
}
