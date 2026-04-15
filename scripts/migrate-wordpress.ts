/**
 * WordPress XML → Prisma migration script
 * Usage: npx tsx scripts/migrate-wordpress.ts <path-to-xml>
 * Requires ADMIN_USER_ID in .env.local (Supabase Auth user ID of the admin)
 */

import "dotenv/config";
import * as fs from "fs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";
import { XMLParser } from "fast-xml-parser";

// ─── Config ────────────────────────────────────────────────────────────────

const XML_FILE = process.argv[2];
const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

if (!XML_FILE) {
  console.error("Usage: npx tsx scripts/migrate-wordpress.ts <path-to-xml>");
  process.exit(1);
}
if (!ADMIN_USER_ID) {
  console.error("Error: ADMIN_USER_ID is not set in .env.local");
  console.error("Set it to your Supabase Auth user ID (Dashboard → Authentication → Users)");
  process.exit(1);
}

// ─── Category mapping: WP nicename → DB slug ───────────────────────────────

const WP_TO_DB: Record<string, string> = {
  // Imaginaire
  fantasy:              "imaginaire",
  "science-fiction":    "imaginaire",
  fantastique:          "imaginaire",
  dystopie:             "imaginaire",
  steampunk:            "imaginaire",
  mythologie:           "imaginaire",
  // Littérature générale
  contemporain:         "litterature",
  classique:            "litterature",
  romance:              "litterature",
  policier:             "litterature",
  historique:           "litterature",
  essai:                "litterature",
  poesie:               "litterature",
  "young-adult":        "litterature",
  // Jeunesse
  jeunesse:             "jeunesse",
  // BD & manga
  bd:                   "bd",
  manga:                "bd",
  // Antiquité
  antiquite:            "antiquite",
  "nerdae-antiquae":    "antiquite",
  // Bilans
  "bilan-de-lannee":    "bilans",
  "bilan-du-mois":      "bilans",
  // Dossiers / curiosités
  "curiosites-livresques": "dossiers",
  "reflexion-sur":      "dossiers",
  rencontre:            "dossiers",
  "maison-dedition-du-mois": "dossiers",
  // Listes / défis
  pal:                  "listes",
  challenges:           "listes",
  tag:                  "listes",
};

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Strip HTML tags and collapse whitespace */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract first <img src="..."> from HTML content */
function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

/** Generate a short excerpt from HTML content (first 250 chars of text) */
function makeExcerpt(html: string): string | null {
  const text = stripHtml(html);
  if (!text) return null;
  return text.length > 250 ? text.slice(0, 250).trimEnd() + "…" : text;
}

/** Decode URL-encoded slugs (%e2%99%a5 → ♥) and lower-case them */
function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw).toLowerCase();
  } catch {
    return raw.toLowerCase();
  }
}

/** Map an array of WP category nicenames to the best DB category slug */
function resolveCategory(nicenames: string[]): string | null {
  for (const name of nicenames) {
    const decoded = decodeSlug(name);
    if (WP_TO_DB[decoded]) return WP_TO_DB[decoded];
  }
  return null;
}

/** Ensure a slug is unique by appending -2, -3, etc. */
function uniqueSlug(base: string, used: Set<string>): string {
  let slug = base;
  let i = 2;
  while (used.has(slug)) {
    slug = `${base}-${i++}`;
  }
  used.add(slug);
  return slug;
}

// ─── Prisma setup ──────────────────────────────────────────────────────────

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Reading XML from: ${XML_FILE}`);
  const xml = fs.readFileSync(XML_FILE, "utf-8");

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    cdataPropName: "__cdata",
    isArray: (name) => ["item", "category", "wp:postmeta"].includes(name),
  });

  const doc = parser.parse(xml);
  const items: any[] = doc?.rss?.channel?.item ?? [];
  console.log(`Found ${items.length} items in XML`);

  // Load existing category slugs → IDs
  const dbCategories = await prisma.category.findMany();
  const categoryIdBySlug = new Map(dbCategories.map((c) => [c.slug, c.id]));
  console.log(`Loaded ${dbCategories.length} categories from DB`);

  const usedSlugs = new Set<string>();
  let created = 0;
  let skipped = 0;

  for (const item of items) {
    // Only import published blog posts
    const postType = item["wp:post_type"]?.__cdata ?? item["wp:post_type"];
    const status   = item["wp:status"]?.__cdata ?? item["wp:status"];
    if (postType !== "post" || status !== "publish") {
      skipped++;
      continue;
    }

    const title   = item.title?.__cdata ?? item.title ?? "(sans titre)";
    const rawSlug = item["wp:post_name"]?.__cdata ?? item["wp:post_name"] ?? "";
    const slug    = uniqueSlug(rawSlug || slugify(title), usedSlugs);

    const rawContent = item["content:encoded"]?.__cdata ?? item["content:encoded"] ?? "";
    const rawExcerpt = item["excerpt:encoded"]?.__cdata ?? item["excerpt:encoded"] ?? "";

    const postDate = item["wp:post_date"]?.__cdata ?? item["wp:post_date"];
    const publishedAt = postDate ? new Date(postDate) : null;

    // Collect WP category nicenames
    const categories: any[] = Array.isArray(item.category)
      ? item.category
      : item.category ? [item.category] : [];
    const nicenames = categories
      .filter((c) => c?.["@_domain"] === "category")
      .map((c) => c?.["@_nicename"] ?? "");

    const dbCategorySlug = resolveCategory(nicenames);
    const categoryId = dbCategorySlug ? categoryIdBySlug.get(dbCategorySlug) ?? null : null;

    // Tags: use all WP category names as tags (for future filtering)
    const tags = categories
      .filter((c) => c?.["@_domain"] === "category")
      .map((c) => {
        const cdata = c?.__cdata ?? c;
        return typeof cdata === "string" ? cdata : "";
      })
      .filter(Boolean);

    // Cover image: extract first <img> in content
    const coverImage = extractFirstImage(rawContent);

    // Excerpt: use WP excerpt if available, otherwise generate from content
    const excerpt =
      (rawExcerpt && rawExcerpt.trim())
        ? rawExcerpt
        : makeExcerpt(rawContent);

    await prisma.article.create({
      data: {
        title,
        slug,
        content:     rawContent,
        excerpt,
        coverImage,
        status:      "DRAFT",
        categoryId,
        tags,
        authorId:    ADMIN_USER_ID!,
        publishedAt,
      },
    });

    created++;
    if (created % 50 === 0) process.stdout.write(`  … ${created} articles importés\r`);
  }

  console.log(`\n✓ ${created} articles importés en DRAFT`);
  console.log(`  ${skipped} items ignorés (pages, médias, etc.)`);
}

/** Minimal slugify fallback when wp:post_name is empty */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
