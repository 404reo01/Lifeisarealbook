import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Pagination } from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "Chroniques — Sabbah de Babel",
  description: "Toutes les chroniques littéraires : romans, imaginaire, jeunesse, bandes dessinées et textes anciens.",
};

const PER_PAGE = 12;

interface PageProps {
  searchParams?: { page?: string };
}

async function getArticles(page: number) {
  const skip = (page - 1) * PER_PAGE;
  try {
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        skip,
        take: PER_PAGE,
        include: { category: true },
      }),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
    ]);
    return { articles, total };
  } catch {
    return { articles: [], total: 0 };
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: { where: { status: "PUBLISHED" } } } } },
    });
  } catch {
    return [];
  }
}

export default async function ChroniquesPage({ searchParams }: PageProps) {
  const currentPage = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);
  const [{ articles, total }, categories] = await Promise.all([
    getArticles(currentPage),
    getCategories(),
  ]);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <main className="max-w-content mx-auto px-6 py-16">
      {/* ─── En-tête ─── */}
      <div className="mb-12">
        <h1 className="font-serif text-5xl font-normal mb-3">Chroniques</h1>
        <p className="font-sans text-muted">
          {total} chronique{total > 1 ? "s" : ""} publiée{total > 1 ? "s" : ""}
        </p>
      </div>

      {/* ─── Filtre catégories ─── */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-12">
          <Link
            href="/chroniques"
            className="font-sans text-sm px-4 py-1.5 rounded-full border border-accent bg-accent/10 text-accent no-underline transition-colors duration-200"
          >
            Tout
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/chroniques/${cat.slug}`}
              className="font-sans text-sm px-4 py-1.5 rounded-full border border-border text-muted no-underline hover:border-accent/50 hover:text-foreground transition-colors duration-200"
            >
              {cat.name}
              {cat._count.articles > 0 && (
                <span className="ml-1.5 text-xs opacity-60">({cat._count.articles})</span>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* ─── Grille articles ─── */}
      {articles.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-2xl text-muted">Aucune chronique pour l&apos;instant.</p>
          <p className="font-sans text-sm text-muted/60 mt-2">Revenez bientôt.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <ArticleCard key={article.id} article={article} featured={i === 0 && currentPage === 1} />
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/chroniques" />
        </>
      )}
    </main>
  );
}
