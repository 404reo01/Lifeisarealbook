import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const CATEGORIES = [
  { name: "Imaginaire",           slug: "imaginaire",  description: "Fantasy, SF, horreur" },
  { name: "Littérature générale", slug: "litterature", description: "Romans et essais" },
  { name: "Jeunesse",             slug: "jeunesse",    description: "Livres pour jeunes lecteurs" },
  { name: "Bandes dessinées",     slug: "bd",          description: "BD, manga, comics" },
  { name: "Antiquité",            slug: "antiquite",   description: "Textes anciens et classiques" },
  { name: "Listes de lecture",    slug: "listes",      description: "Sélections thématiques" },
  { name: "Bilans annuels",       slug: "bilans",      description: "Rétrospectives par année" },
  { name: "Dossiers",             slug: "dossiers",    description: "Explorations approfondies" },
  { name: "Culture",              slug: "culture",     description: "Cinéma, séries, musique, arts" },
];

async function main() {
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where:  { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: { name: cat.name, slug: cat.slug, description: cat.description },
    });
    console.log(`✓ ${cat.name}`);
  }
  console.log("Seed terminé.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
