import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-content mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-sans text-muted">
        <p className="font-serif text-base text-foreground">Sabbah de Babel</p>

        <nav className="flex flex-wrap justify-center gap-6">
          <Link href="/chroniques" className="hover:text-foreground transition-colors no-underline">
            Chroniques
          </Link>
          <Link href="/curiosites" className="hover:text-foreground transition-colors no-underline">
            Curiosités
          </Link>
          <Link href="/culture" className="hover:text-foreground transition-colors no-underline">
            Culture
          </Link>
          <Link href="/a-propos" className="hover:text-foreground transition-colors no-underline">
            À propos
          </Link>
        </nav>

        <div className="flex flex-col items-center md:items-end gap-1">
          <p>© {new Date().getFullYear()} Sabbah de Babel</p>
          <p className="text-xs text-muted/50">Developed by REO</p>
        </div>
      </div>
    </footer>
  );
}
