/**
 * Assign the "culture" category to articles that have cinema/séries/TV tags
 * from the WordPress import (stored as tag display names).
 */
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const CULTURE_TAGS = ["Cinéma", "Séries", "Série TV", "Culture", "Musique"];

async function main() {
  const category = await prisma.category.findUnique({ where: { slug: "culture" } });
  if (!category) {
    console.error("Category 'culture' not found — run seed first");
    process.exit(1);
  }

  const result = await prisma.article.updateMany({
    where: {
      categoryId: null,
      tags: { hasSome: CULTURE_TAGS },
    },
    data: { categoryId: category.id },
  });

  console.log(`✓ ${result.count} articles assignés à la catégorie Culture`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
