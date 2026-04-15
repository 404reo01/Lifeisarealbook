import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  const result = await prisma.article.updateMany({
    where: { status: "DRAFT" },
    data: { status: "PUBLISHED" },
  });
  console.log(`✓ ${result.count} articles publiés`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
