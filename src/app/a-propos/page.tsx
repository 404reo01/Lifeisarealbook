import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "À propos — Sabbah de Babel",
  description: "Life Is A Real Book — le blog littéraire de Nawal et Cassie.",
};

async function getCurrentReads() {
  try {
    return await prisma.currentRead.findMany();
  } catch {
    return [];
  }
}

export default async function AProposPage() {
  const reads = await getCurrentReads();
  const nanou  = reads.find((r) => r.reader === "nanou");
  const cassie = reads.find((r) => r.reader === "cassie");

  return (
    <main className="max-w-prose mx-auto px-6 py-16">
      <h1 className="font-serif text-5xl font-normal mb-10">À propos</h1>

      <div className="flex items-center gap-4 mb-12">
        <div className="flex-1 h-px bg-border" />
        <span className="text-accent text-lg">✦</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* ─── Le blog ─── */}
      <div className="prose-literary mb-14">
        <p>
          <em>Life Is A Real Book</em> — parce que la vie de sa créatrice pourrait
          se résumer à ses lectures. Ce blog est un territoire personnel pour exprimer
          des avis et des réflexions sur les ouvrages lus : chroniques, lectures en cours,
          et tout ce qui gravite autour — salons, rencontres d&apos;auteurs, coups de cœur.
        </p>
        <p>
          Spécialisé dans l&apos;imaginaire à l&apos;origine, il s&apos;est élargi au fil
          du temps à la littérature générale, à la jeunesse, aux bandes dessinées
          et aux textes anciens. Un labyrinthe de lectures dans lequel on aime se perdre.
        </p>
      </div>

      {/* ─── Les autrices ─── */}
      <h2 className="font-serif text-3xl font-normal mb-8">Les autrices</h2>

      <div className="space-y-10 mb-16">
        {/* Nawal */}
        <div className="glass-card border rounded-xl p-6">
          <h3 className="font-serif text-2xl font-normal mb-4 text-accent">Nawal</h3>
          <div className="prose-literary text-base">
            <p>
              Professeure en lettres classiques, Nawal est passionnée par les livres
              depuis l&apos;enfance. Curieuse de nature, elle s&apos;intéresse à la photographie,
              à l&apos;écriture et pratique les arts martiaux depuis son plus jeune âge.
            </p>
            <p>
              Réservée, rêveuse, idéaliste — son véritable univers réside dans les
              bibliothèques. En grandissant, elle a développé un esprit critique sur
              les ouvrages qu&apos;elle dévore, ce qui a donné naissance à ce blog.
            </p>
          </div>
        </div>

        {/* Cassie */}
        <div className="glass-card border rounded-xl p-6">
          <h3 className="font-serif text-2xl font-normal mb-4 text-accent">Cassie</h3>
          <div className="prose-literary text-base">
            <p>
              Apprentie libraire, Cassie a rejoint Nawal pendant leurs études universitaires.
              Très curieuse, grande névrosée autodéclarée, elle adore décortiquer les univers
              complexes et les systèmes de magie.
            </p>
            <p>
              Sa passion tourne autour des livres et de l&apos;imaginaire — particulièrement
              la langue et la magie. Elle apprécie les plumes qui osent et se distinguent,
              avec une affection particulière pour les thèmes maudits.
            </p>
          </div>
        </div>
      </div>

      {/* ─── En ce moment ─── */}
      <div className="flex items-center gap-4 mb-10">
        <div className="flex-1 h-px bg-border" />
        <span className="text-accent text-lg">✦</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <h2 className="font-serif text-3xl font-normal mb-8">En ce moment</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
        {[
          { key: "nanou", label: "Nawal lit…", data: nanou },
          { key: "cassie", label: "Cassie lit…", data: cassie },
        ].map(({ key, label, data }) => (
          <div key={key} className="glass-card border rounded-xl p-5 flex gap-4 items-start">
            {/* Couverture */}
            <div className="shrink-0 w-16 h-24 rounded overflow-hidden border border-border bg-border/20">
              {data?.coverImage ? (
                <Image
                  src={data.coverImage}
                  alt={data.title}
                  width={64}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted text-xl">📖</span>
                </div>
              )}
            </div>

            {/* Infos */}
            <div>
              <p className="font-sans text-xs text-accent uppercase tracking-wide mb-1">
                {label}
              </p>
              {data ? (
                <>
                  <p className="font-serif text-lg leading-snug">{data.title}</p>
                  <p className="font-sans text-sm text-muted mt-0.5">{data.author}</p>
                </>
              ) : (
                <p className="font-serif text-lg text-muted italic">À venir…</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Contact ─── */}
      <div className="pt-8 border-t border-border">
        <p className="font-sans text-sm text-muted">
          Une question, une suggestion, un livre à recommander ?{" "}
          <a
            href="mailto:contact@lifeisarealbook.fr"
            className="text-accent no-underline hover:underline transition-all"
          >
            Écrivez-nous.
          </a>
        </p>
      </div>
    </main>
  );
}
