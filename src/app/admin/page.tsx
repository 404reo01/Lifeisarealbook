import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { togglePublish } from "@/actions/articles";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { PlusCircle, Edit2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

async function getStats() {
  const [published, drafts] = await Promise.all([
    prisma.article.count({ where: { status: "PUBLISHED" } }).catch(() => 0),
    prisma.article.count({ where: { status: "DRAFT" } }).catch(() => 0),
  ]);
  return { published, drafts };
}

async function getAllArticles() {
  return prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  }).catch(() => []);
}

function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
}

export default async function AdminPage() {
  const [stats, articles] = await Promise.all([getStats(), getAllArticles()]);

  return (
    <div className="px-6 py-10 max-w-5xl">
      {/* ─── En-tête ─── */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-serif text-3xl font-normal">Tableau de bord</h1>
          <p className="font-sans text-sm text-muted mt-0.5">Bienvenue dans l&apos;espace éditorial.</p>
        </div>
        <Link href="/admin/articles/new" className="admin-btn-primary no-underline">
          <PlusCircle size={15} className="inline mr-1.5" />
          Nouvelle chronique
        </Link>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Publiées", value: stats.published, accent: true },
          { label: "Brouillons", value: stats.drafts, accent: false },
          { label: "Total", value: stats.published + stats.drafts, accent: false },
        ].map(({ label, value, accent }) => (
          <div key={label} className="glass-card border rounded-lg px-5 py-4">
            <p className={cn("font-serif text-3xl font-normal", accent ? "text-accent" : "text-foreground")}>
              {value}
            </p>
            <p className="font-sans text-xs text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ─── Liste articles ─── */}
      <div className="glass-card border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between">
          <p className="font-sans text-sm font-medium">Toutes les chroniques</p>
        </div>

        {articles.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-serif text-xl text-muted">Aucune chronique pour l&apos;instant.</p>
            <Link href="/admin/articles/new" className="font-sans text-sm text-accent no-underline mt-2 inline-block hover:opacity-75">
              Créer la première →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {articles.map((article) => (
              <li key={article.id} className="flex items-center gap-3 px-5 py-3 hover:bg-border/10 transition-colors">
                {/* Status badge */}
                <span className={cn(
                  "shrink-0 font-sans text-2xs px-2 py-0.5 rounded-full border",
                  article.status === "PUBLISHED"
                    ? "text-green-400 border-green-400/30 bg-green-400/10"
                    : "text-muted border-border"
                )}>
                  {article.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                </span>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm text-foreground truncate">{article.title}</p>
                  <p className="font-sans text-xs text-muted">
                    {article.category?.name ?? "Sans catégorie"} · {formatDate(article.updatedAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Toggle publish */}
                  <form action={togglePublish.bind(null, article.id, article.status)}>
                    <button
                      type="submit"
                      title={article.status === "PUBLISHED" ? "Dépublier" : "Publier"}
                      className="p-1.5 rounded text-muted hover:text-foreground hover:bg-border/30 transition-colors"
                    >
                      {article.status === "PUBLISHED"
                        ? <EyeOff size={14} />
                        : <Eye size={14} />}
                    </button>
                  </form>

                  {/* Edit */}
                  <Link
                    href={`/admin/articles/${article.id}`}
                    className="p-1.5 rounded text-muted hover:text-foreground hover:bg-border/30 transition-colors no-underline"
                  >
                    <Edit2 size={14} />
                  </Link>

                  {/* Delete */}
                  <DeleteButton id={article.id} title={article.title} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
