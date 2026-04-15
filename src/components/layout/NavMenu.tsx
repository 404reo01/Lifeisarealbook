"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Chroniques",
    href: "/chroniques",
    children: [
      { label: "Imaginaire", href: "/chroniques/imaginaire" },
      { label: "Littérature générale", href: "/chroniques/litterature" },
      { label: "Jeunesse", href: "/chroniques/jeunesse" },
      { label: "Bandes dessinées", href: "/chroniques/bd" },
      { label: "Antiquité", href: "/chroniques/antiquite" },
    ],
  },
  {
    label: "Curiosités",
    href: "/curiosites",
    children: [
      { label: "Listes de lecture", href: "/curiosites/listes" },
      { label: "Bilans annuels", href: "/curiosites/bilans" },
      { label: "Dossiers", href: "/curiosites/dossiers" },
    ],
  },
  { label: "Culture", href: "/culture" },
  { label: "À propos", href: "/a-propos" },
];

function NavItem({
  item,
}: {
  item: (typeof NAV_ITEMS)[number];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isActive = pathname.startsWith(item.href);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className={cn(
          "px-3 py-1.5 text-sm font-sans no-underline rounded transition-colors duration-200",
          isActive
            ? "text-foreground"
            : "text-muted hover:text-foreground"
        )}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 px-3 py-1.5 text-sm font-sans rounded transition-colors duration-200",
          isActive ? "text-foreground" : "text-muted hover:text-foreground"
        )}
      >
        {item.label}
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={cn("transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-44 py-1 glass border rounded-lg animate-fade-in">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block px-4 py-2 text-sm font-sans no-underline transition-colors duration-200",
                pathname === child.href
                  ? "text-accent"
                  : "text-muted hover:text-foreground hover:bg-border/30"
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function NavMenu() {
  return (
    <>
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}
    </>
  );
}
