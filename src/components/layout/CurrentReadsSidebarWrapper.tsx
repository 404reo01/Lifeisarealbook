"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function CurrentReadsSidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // On non-home pages: always visible. On home: visible only after hero scrolls out.
  const [visible, setVisible] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setVisible(true);
      return;
    }

    const hero = document.getElementById("hero-section");
    if (!hero) { setVisible(true); return; }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [isHome]);

  if (!visible) return null;
  return <>{children}</>;
}
