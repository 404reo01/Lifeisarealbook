import Link from "next/link";
import { SmokeBackground } from "@/components/layout/SmokeBackground";

export function HeroSection() {
  return (
    <section id="hero-section" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

      {/* ─── Fumée ─────────────────────────────────────────────────────── */}
      <SmokeBackground />

      {/* ─── Contenu ───────────────────────────────────────────────────── */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <p className="font-sans text-xs tracking-[0.25em] uppercase text-muted mb-8 animate-fade-in">
          Chroniques littéraires
        </p>

        <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-normal leading-[1.05] text-balance mb-8 animate-slide-up">
          Des livres lus,{" "}
          <br className="hidden sm:block" />
          <em className="not-italic text-accent">des mots partagés.</em>
        </h1>

        <p
          className="font-sans text-base md:text-lg text-muted max-w-xl mx-auto leading-relaxed mb-12 animate-slide-up"
          style={{ animationDelay: "80ms" }}
        >
          Critiques passionnées, listes de lecture et curiosités littéraires —
          un regard honnête sur les livres qui comptent.
        </p>

        <div
          className="flex flex-wrap justify-center gap-4 animate-slide-up"
          style={{ animationDelay: "160ms" }}
        >
          <Link
            href="/chroniques"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-fg font-sans text-sm rounded no-underline hover:opacity-90 transition-opacity"
          >
            Lire les chroniques
          </Link>
          <Link
            href="/a-propos"
            className="inline-flex items-center px-6 py-3 border border-border font-sans text-sm rounded no-underline text-muted hover:text-foreground hover:border-foreground/50 transition-colors backdrop-blur-sm"
          >
            À propos
          </Link>
        </div>
      </div>

      {/* ─── Scroll indicator ──────────────────────────────────────────── */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in"
        style={{ animationDelay: "400ms" }}
      >
        <span className="font-sans text-xs text-muted tracking-widest uppercase">Défiler</span>
        <div className="w-px h-10 bg-gradient-to-b from-muted/50 to-transparent" />
      </div>
    </section>
  );
}
