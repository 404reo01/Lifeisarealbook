import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article/ArticleCard";
import { HeroSection } from "@/components/layout/HeroSection";

// Always fetch from DB — never use static build cache
export const dynamic = "force-dynamic";

async function getLatestArticles() {
  try {
    return await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 6,
      include: { category: true },
    });
  } catch {
    return [];
  }
}

const CATEGORIES = [
  { label: "Imaginaire",       href: "/chroniques/imaginaire",  description: "Fantasy, SF, horreur" },
  { label: "Littérature",      href: "/chroniques/litterature", description: "Romans et essais" },
  { label: "Jeunesse",         href: "/chroniques/jeunesse",    description: "Livres pour jeunes lecteurs" },
  { label: "Bandes dessinées", href: "/chroniques/bd",          description: "BD, manga, comics" },
  { label: "Antiquité",        href: "/chroniques/antiquite",   description: "Textes anciens et classiques" },
  { label: "Curiosités",       href: "/curiosites",             description: "Listes, bilans, dossiers" },
  { label: "Culture",          href: "/culture",                description: "Cinéma, séries, musique" },
];

export default async function HomePage() {
  const articles = await getLatestArticles();

  return (
    <>
      {/* ─── Hero ─── */}
      <HeroSection />

      <div className="max-w-content mx-auto px-6">
        <div className="h-px bg-border" />
      </div>

      {/* ─── Explorer par genre ─── */}
      <section className="max-w-content mx-auto px-6 py-16">
        <h2 className="font-serif text-2xl font-normal text-center mb-10">
          Explorer par genre
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group p-5 rounded-lg border glass-card no-underline"
            >
              <p className="font-serif text-lg text-foreground group-hover:text-accent transition-colors duration-200">
                {cat.label}
              </p>
              <p className="font-sans text-sm text-muted mt-1">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="max-w-content mx-auto px-6">
        <div className="h-px bg-border" />
      </div>

      {/* ─── Dernières chroniques ─── */}
      <section className="max-w-content mx-auto px-6 py-16">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="font-serif text-2xl font-normal">Dernières chroniques</h2>
          <Link
            href="/chroniques"
            className="font-sans text-sm text-muted hover:text-accent transition-colors no-underline"
          >
            Tout voir →
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-serif text-2xl text-muted">
              Les premières chroniques arrivent bientôt.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <ArticleCard key={article.id} article={article} featured={i === 0} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
