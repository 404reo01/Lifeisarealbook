import Link from "next/link";
import Image from "next/image";
import type { Article, Category } from "@/types/database";
import { cn } from "@/lib/utils";

type ArticleWithCategory = Article & { category: Category | null };

function formatDate(date: Date | string | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function ArticleCard({
  article,
  featured = false,
}: {
  article: ArticleWithCategory;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/chroniques/${article.slug}`}
      className={cn(
        "group block rounded-lg border border-border bg-surface overflow-hidden",
        "hover:border-accent/50 transition-colors duration-200 no-underline",
        featured && "md:col-span-2"
      )}
    >
      {/* Cover image */}
      {article.coverImage && (
        <div className={cn("overflow-hidden bg-border/20", featured ? "h-56" : "h-44")}>
          <Image
            src={article.coverImage}
            alt={article.title}
            width={800}
            height={400}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-350"
          />
        </div>
      )}

      <div className="p-5">
        {/* Category + date */}
        <div className="flex items-center gap-2 mb-3">
          {article.category && (
            <span className="font-sans text-xs text-accent uppercase tracking-wide">
              {article.category.name}
            </span>
          )}
          {article.category && article.publishedAt && (
            <span className="text-border">·</span>
          )}
          {article.publishedAt && (
            <span className="font-sans text-xs text-muted">
              {formatDate(article.publishedAt)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={cn(
          "font-serif font-normal text-foreground group-hover:text-accent transition-colors duration-200 mb-2",
          featured ? "text-2xl" : "text-xl"
        )}>
          {article.title}
        </h3>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="font-sans text-sm text-muted leading-relaxed line-clamp-2">
            {article.excerpt}
          </p>
        )}

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="font-sans text-xs px-2 py-0.5 rounded bg-border/40 text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
