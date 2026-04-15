"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, FileText, PlusCircle, BookOpen, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Tableau de bord",    href: "/admin",              icon: LayoutDashboard },
  { label: "Chroniques",         href: "/admin/articles",     icon: FileText },
  { label: "Nouvelle chronique", href: "/admin/articles/new", icon: PlusCircle },
  { label: "En ce moment",       href: "/admin/en-ce-moment", icon: BookOpen },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ─── Sidebar (desktop) ─── */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border glass-strong sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-border/60">
          <Link href="/" className="block">
            <Image
              src="/logo.png"
              alt="Sabbah de Babel"
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <p className="font-sans text-xs text-muted mt-1">Admin</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md font-sans text-sm no-underline transition-colors duration-150",
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-muted hover:text-foreground hover:bg-border/30"
                )}
              >
                <Icon size={15} strokeWidth={1.8} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-border/60">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md font-sans text-sm text-muted hover:text-foreground hover:bg-border/30 transition-colors duration-150"
          >
            <LogOut size={15} strokeWidth={1.8} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ─── Top bar (mobile) ─── */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border glass-strong sticky top-0 z-40">
        <Link href="/admin">
          <Image src="/logo.png" alt="Sabbah de Babel" width={100} height={34} className="h-7 w-auto" />
        </Link>
        <div className="flex items-center gap-1">
          {NAV.map(({ href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "p-2 rounded transition-colors",
                pathname.startsWith(href) ? "text-accent" : "text-muted"
              )}
            >
              <Icon size={18} strokeWidth={1.8} />
            </Link>
          ))}
          <button onClick={handleLogout} className="p-2 text-muted hover:text-foreground transition-colors">
            <LogOut size={18} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* ─── Main content ─── */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
