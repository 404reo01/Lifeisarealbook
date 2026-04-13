// Re-export Prisma types for convenience across the app.
// The source of truth is prisma/schema.prisma.
export type { Article, Category, ArticleStatus } from "@/generated/prisma/client";
