import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Pagination } from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "Culture — Sabbah de Babel",
  description: "Cinéma, séries, musique et arts : réflexions culturelles au-delà des livres.",
};

const PER_PAGE = 12;

interface PageProps {
  searchParams?: { page?: string };
}

async function getCultureArticles(page: number) {
  const skip = (page - 1) * PER_PAGE;
  try {
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: { status: "PUBLISHED", category: { slug: "culture" } },
        orderBy: { publishedAt: "desc" },
        skip,
        take: PER_PAGE,
        include: { category: true },
      }),
      prisma.article.count({
        where: { status: "PUBLISHED", category: { slug: "culture" } },
      }),
    ]);
    return { articles, total };
  } catch {
    return { articles: [], total: 0 };
  }
}

const THEMES = [
  { label: "Cinéma",    tag: "Cinéma",    description: "Critiques et coups de cœur" },
  { label: "Séries TV", tag: "Série TV",  description: "Series et mini-séries" },
  { label: "Musique",   tag: "Musique",   description: "Découvertes musicales" },
];

export default async function CulturePage({ searchParams }: PageProps) {
  const currentPage = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);
  const { articles, total } = await getCultureArticles(currentPage);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <main className="max-w-content mx-auto px-6 py-16">
      {/* ─── En-tête ─── */}
      <div className="mb-12">
        <h1 className="font-serif text-5xl font-normal mb-3">Culture</h1>
        <p className="font-sans text-muted">
          Cinéma, séries, musique — ce qui nourrit l&apos;imaginaire au-delà des livres.
        </p>
      </div>

      {/* ─── Thèmes ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
        {THEMES.map((t) => (
          <div key={t.tag} className="p-5 rounded-lg border glass-card">
            <p className="font-serif text-lg text-foreground">{t.label}</p>
            <p className="font-sans text-sm text-muted mt-1">{t.description}</p>
          </div>
        ))}
      </div>

      <div className="h-px bg-border mb-12" />

      {/* ─── Articles ─── */}
      {total > 0 && (
        <p className="font-sans text-sm text-muted mb-8">
          {total} article{total > 1 ? "s" : ""}
        </p>
      )}

      {articles.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-3xl text-muted font-normal">Bientôt.</p>
          <p className="font-sans text-sm text-muted/60 mt-3 max-w-sm mx-auto">
            Des articles cinéma, séries et musique arrivent prochainement.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <ArticleCard key={article.id} article={article} featured={i === 0 && currentPage === 1} />
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/culture" />
        </>
      )}
    </main>
  );
}
