import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article/ArticleCard";

export const metadata: Metadata = {
  title: "Curiosités — Sabbah de Babel",
  description: "Listes de lecture, bilans annuels et dossiers culturels.",
};

const SECTIONS = [
  { label: "Listes de lecture", href: "/curiosites/listes", slug: "listes", description: "Sélections thématiques" },
  { label: "Bilans annuels", href: "/curiosites/bilans", slug: "bilans", description: "Rétrospectives par année" },
  { label: "Dossiers", href: "/curiosites/dossiers", slug: "dossiers", description: "Explorations approfondies" },
];

const CURIOSITES_SLUGS = ["listes", "bilans", "dossiers"];

async function getCuriosites() {
  try {
    return await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        category: { slug: { in: CURIOSITES_SLUGS } },
      },
      orderBy: { publishedAt: "desc" },
      include: { category: true },
    });
  } catch {
    return [];
  }
}

export default async function CuriositesPage() {
  const articles = await getCuriosites();

  return (
    <main className="max-w-content mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="font-serif text-5xl font-normal mb-3">Curiosités</h1>
        <p className="font-sans text-muted">Listes, bilans et dossiers culturels.</p>
      </div>

      {/* ─── Sections ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group p-5 rounded-lg border glass-card no-underline"
          >
            <p className="font-serif text-lg text-foreground group-hover:text-accent transition-colors duration-200">
              {s.label}
            </p>
            <p className="font-sans text-sm text-muted mt-1">{s.description}</p>
          </Link>
        ))}
      </div>

      {/* ─── Articles ─── */}
      {articles.length > 0 && (
        <>
          <div className="h-px bg-border mb-12" />
          <h2 className="font-serif text-2xl font-normal mb-8">Dernières publications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <ArticleCard key={article.id} article={article} featured={i === 0} />
            ))}
          </div>
        </>
      )}

      {articles.length === 0 && (
        <div className="py-20 text-center">
          <p className="font-serif text-2xl text-muted">Aucune curiosité publiée pour l&apos;instant.</p>
        </div>
      )}
    </main>
  );
}
