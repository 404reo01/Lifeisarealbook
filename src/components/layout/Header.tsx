import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NavMenu } from "@/components/layout/NavMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b glass-strong">
      <div className="max-w-content mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="shrink-0 no-underline hover:opacity-100">
          <Image
            src="/logo.png"
            alt="Sabbah de Babel"
            width={140}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        {/* Navigation principale */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          <NavMenu />
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
