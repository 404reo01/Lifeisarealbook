import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/ArticleForm";
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } }).catch(() => null);
  return { title: article ? `Éditer — ${article.title}` : "Article introuvable" };
}

export default async function EditArticlePage({ params, searchParams }: PageProps) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);

  const [article, categories] = await Promise.all([
    prisma.article.findUnique({ where: { id }, include: { category: true } }).catch(() => null),
    prisma.category.findMany({ orderBy: { name: "asc" } }).catch(() => []),
  ]);

  if (!article) notFound();

  return (
    <div className="px-6 py-10 max-w-4xl">
      <div className="flex items-start justify-between mb-8 gap-4">
        <h1 className="font-serif text-3xl font-normal leading-tight">{article.title}</h1>
        {article.status === "PUBLISHED" && (
          <Link
            href={`/chroniques/${article.slug}`}
            target="_blank"
            className="shrink-0 flex items-center gap-1.5 font-sans text-sm text-muted hover:text-accent no-underline transition-colors"
          >
            <ExternalLink size={14} />
            Voir l&apos;article
          </Link>
        )}
      </div>

      {saved && (
        <div className="mb-6 px-4 py-2.5 rounded-lg bg-green-400/10 border border-green-400/20 font-sans text-sm text-green-400">
          Chronique créée avec succès.
        </div>
      )}

      <ArticleForm article={article} categories={categories} />
    </div>
  );
}
