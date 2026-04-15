import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/ArticleForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nouvelle chronique — Admin" };

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } }).catch(() => []);
}

export default async function NewArticlePage() {
  const categories = await getCategories();

  return (
    <div className="px-6 py-10 max-w-4xl">
      <h1 className="font-serif text-3xl font-normal mb-8">Nouvelle chronique</h1>
      <ArticleForm categories={categories} />
    </div>
  );
}
