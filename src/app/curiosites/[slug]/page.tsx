import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Pagination } from "@/components/ui/Pagination";

const PER_PAGE = 12;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: { page?: string };
}

const SECTION_LABELS: Record<string, string> = {
  listes:   "Listes de lecture",
  bilans:   "Bilans annuels",
  dossiers: "Dossiers",
};

const VALID_SLUGS = Object.keys(SECTION_LABELS);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const label = SECTION_LABELS[slug];
  if (!label) return { title: "Page introuvable — Sabbah de Babel" };
  return { title: `${label} — Sabbah de Babel` };
}

export default async function CuriositesSlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;

  if (!VALID_SLUGS.includes(slug)) notFound();

  const currentPage = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);
  const skip = (currentPage - 1) * PER_PAGE;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED", category: { slug } },
      orderBy: { publishedAt: "desc" },
      skip,
      take: PER_PAGE,
      include: { category: true },
    }).catch(() => []),
    prisma.article.count({ where: { status: "PUBLISHED", category: { slug } } }).catch(() => 0),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const label = SECTION_LABELS[slug];

  return (
    <main className="max-w-content mx-auto px-6 py-16">
      <div className="mb-4">
        <Link href="/curiosites" className="font-sans text-sm text-muted hover:text-accent no-underline transition-colors">
          ← Curiosités
        </Link>
      </div>

      <div className="mb-12">
        <h1 className="font-serif text-5xl font-normal mb-3">{label}</h1>
        <p className="font-sans text-sm text-muted/60">
          {total} publication{total > 1 ? "s" : ""}
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-2xl text-muted">Aucune publication dans cette section.</p>
          <p className="font-sans text-sm text-muted/60 mt-2">Revenez bientôt.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <ArticleCard key={article.id} article={article} featured={i === 0 && currentPage === 1} />
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/curiosites/${slug}`} />
        </>
      )}
    </main>
  );
}
