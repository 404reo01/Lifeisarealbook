import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

function pageHref(page: number, basePath: string) {
  return page === 1 ? basePath : `${basePath}?page=${page}`;
}

function buildRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("…");

  pages.push(total);
  return pages;
}

export function Pagination({ currentPage, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null;

  const range = buildRange(currentPage, totalPages);

  return (
    <nav className="flex justify-center items-center gap-1.5 mt-16" aria-label="Pagination">
      {/* Précédent */}
      {currentPage > 1 ? (
        <Link
          href={pageHref(currentPage - 1, basePath)}
          className="font-sans text-sm px-3 py-1.5 rounded border border-border text-muted hover:border-accent/50 hover:text-foreground transition-colors no-underline"
        >
          ←
        </Link>
      ) : (
        <span className="font-sans text-sm px-3 py-1.5 rounded border border-border/30 text-muted/30 cursor-default">
          ←
        </span>
      )}

      {/* Pages */}
      {range.map((item, i) =>
        item === "…" ? (
          <span key={`ellipsis-${i}`} className="font-sans text-sm text-muted/50 px-1">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={pageHref(item, basePath)}
            className={cn(
              "font-sans text-sm w-9 h-9 flex items-center justify-center rounded border transition-colors no-underline",
              item === currentPage
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:border-accent/50 hover:text-foreground"
            )}
          >
            {item}
          </Link>
        )
      )}

      {/* Suivant */}
      {currentPage < totalPages ? (
        <Link
          href={pageHref(currentPage + 1, basePath)}
          className="font-sans text-sm px-3 py-1.5 rounded border border-border text-muted hover:border-accent/50 hover:text-foreground transition-colors no-underline"
        >
          →
        </Link>
      ) : (
        <span className="font-sans text-sm px-3 py-1.5 rounded border border-border/30 text-muted/30 cursor-default">
          →
        </span>
      )}
    </nav>
  );
}
