import Link from "next/link";
import Image from "next/image";
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

// ─── Types ──────────────────────────────────────────────────────────────────

type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  createdAt: Date;
  _count: { articles: number };
};

type ArticleWithCategory = NonNullable<Awaited<ReturnType<typeof prisma.article.findUnique>>> & {
  category: { id: string; name: string; slug: string; description: string | null; parentId: string | null; createdAt: Date } | null;
};

// ─── Resolve: category feed or article detail ───────────────────────────────

async function resolveSlug(slug: string) {
  const [category, article] = await Promise.all([
    prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { articles: { where: { status: "PUBLISHED" } } } } },
    }).catch(() => null) as Promise<CategoryWithCount | null>,
    prisma.article.findUnique({
      where: { slug },
      include: { category: true },
    }).catch(() => null) as Promise<ArticleWithCategory | null>,
  ]);

  if (category) return { type: "category" as const, category };
  if (article && article.status === "PUBLISHED") return { type: "article" as const, article };
  return null;
}

// ─── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved) return { title: "Page introuvable — Sabbah de Babel" };

  if (resolved.type === "category") {
    return {
      title: `${resolved.category.name} — Sabbah de Babel`,
      description: resolved.category.description ?? undefined,
    };
  }

  return {
    title: `${resolved.article.title} — Sabbah de Babel`,
    description: resolved.article.excerpt ?? undefined,
    openGraph: resolved.article.coverImage
      ? { images: [{ url: resolved.article.coverImage }] }
      : undefined,
  };
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function SlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved) notFound();

  if (resolved.type === "category") {
    const currentPage = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);
    return <CategoryFeed slug={slug} category={resolved.category} currentPage={currentPage} />;
  }

  return <ArticlePage article={resolved.article} />;
}

// ─── Category feed ──────────────────────────────────────────────────────────

async function CategoryFeed({
  slug,
  category,
  currentPage,
}: {
  slug: string;
  category: CategoryWithCount;
  currentPage: number;
}) {
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
  const basePath = `/chroniques/${slug}`;

  return (
    <main className="max-w-content mx-auto px-6 py-16">
      <div className="mb-4">
        <Link href="/chroniques" className="font-sans text-sm text-muted hover:text-accent no-underline transition-colors">
          ← Toutes les chroniques
        </Link>
      </div>

      <div className="mb-12">
        <h1 className="font-serif text-5xl font-normal mb-3">{category.name}</h1>
        {category.description && (
          <p className="font-sans text-muted">{category.description}</p>
        )}
        <p className="font-sans text-sm text-muted/60 mt-1">
          {category._count.articles} chronique{category._count.articles > 1 ? "s" : ""}
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-2xl text-muted">Aucune chronique dans cette catégorie.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <ArticleCard key={article.id} article={article} featured={i === 0 && currentPage === 1} />
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} />
        </>
      )}
    </main>
  );
}

// ─── Article detail ──────────────────────────────────────────────────────────

function formatDate(date: Date | string | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function estimateReadingTime(content: string): number {
  const words = content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function ArticlePage({ article }: { article: ArticleWithCategory }) {
  const readingTime = estimateReadingTime(article.content);

  return (
    <article className="max-w-prose-lg mx-auto px-6 py-16">
      {/* ─── Breadcrumb ─── */}
      <nav className="mb-10 flex items-center gap-2 font-sans text-sm text-muted">
        <Link href="/chroniques" className="hover:text-accent no-underline transition-colors">
          Chroniques
        </Link>
        {article.category && (
          <>
            <span>/</span>
            <Link
              href={`/chroniques/${article.category.slug}`}
              className="hover:text-accent no-underline transition-colors"
            >
              {article.category.name}
            </Link>
          </>
        )}
      </nav>

      {/* ─── Meta ─── */}
      <div className="flex flex-wrap items-center gap-3 mb-6 font-sans text-sm">
        {article.category && (
          <span className="text-accent uppercase tracking-wide text-xs">
            {article.category.name}
          </span>
        )}
        {article.publishedAt && (
          <span className="text-muted">{formatDate(article.publishedAt)}</span>
        )}
        <span className="text-muted/60">{readingTime} min de lecture</span>
      </div>

      {/* ─── Titre ─── */}
      <h1 className="font-serif text-4xl md:text-5xl font-normal leading-tight mb-6 text-balance">
        {article.title}
      </h1>

      {/* ─── Excerpt ─── */}
      {article.excerpt && (
        <p className="font-sans text-lg text-muted leading-relaxed mb-10 border-l-2 border-accent pl-5 italic">
          {article.excerpt}
        </p>
      )}

      {/* ─── Cover image ─── */}
      {article.coverImage && (
        <div className="relative w-full aspect-[16/7] overflow-hidden rounded-lg mb-12 glass border">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* ─── Séparateur ─── */}
      <div className="flex items-center gap-4 mb-12">
        <div className="flex-1 h-px bg-border" />
        <span className="text-accent text-lg">✦</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* ─── Contenu Tiptap ─── */}
      <div
        className="prose-literary"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* ─── Tags ─── */}
      {article.tags.length > 0 && (
        <div className="mt-16 pt-8 border-t border-border flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="font-sans text-xs px-3 py-1 rounded-full border border-border text-muted glass"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* ─── Retour ─── */}
      <div className="mt-12">
        <Link
          href="/chroniques"
          className="font-sans text-sm text-muted hover:text-accent no-underline transition-colors"
        >
          ← Retour aux chroniques
        </Link>
      </div>
    </article>
  );
}
