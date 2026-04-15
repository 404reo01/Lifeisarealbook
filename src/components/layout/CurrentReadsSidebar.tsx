import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getReads() {
  try {
    return await prisma.currentRead.findMany();
  } catch {
    return [];
  }
}

export async function CurrentReadsSidebar() {
  const reads = await getReads();
  const nanou  = reads.find((r) => r.reader === "nanou");
  const cassie = reads.find((r) => r.reader === "cassie");

  if (!nanou && !cassie) return null;

  return (
    <aside className="hidden xl:flex flex-col gap-4 fixed right-6 top-28 w-72 z-40">
      <p className="font-serif text-base text-muted mb-1 pl-1">En ce moment…</p>

      {[
        { label: "Nawal lit",  data: nanou },
        { label: "Cassie lit", data: cassie },
      ].map(({ label, data }) =>
        data ? (
          <Link
            key={label}
            href="/a-propos"
            className="no-underline group"
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              padding: "1rem",
              borderRadius: "0.75rem",
              border: "1px solid var(--glass-border-soft)",
              background: "var(--glass-bg-strong)",
              backdropFilter: "blur(16px) saturate(180%)",
              WebkitBackdropFilter: "blur(16px) saturate(180%)",
              boxShadow: "var(--glass-shadow-lg), 0 0 0 1px rgba(168,122,200,0.12)",
            }}
          >
            {/* Couverture */}
            <div
              className="shrink-0 w-16 rounded-md overflow-hidden shadow-md"
              style={{ height: "6rem", border: "1px solid var(--color-border)" }}
            >
              {data.coverImage ? (
                <Image
                  src={data.coverImage}
                  alt={data.title}
                  width={64}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-border/20 flex items-center justify-center text-2xl">
                  📖
                </div>
              )}
            </div>

            {/* Texte */}
            <div className="min-w-0">
              <p className="font-sans text-xs text-accent tracking-wide mb-1">{label}</p>
              <p className="font-serif text-base leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                {data.title}
              </p>
              <p className="font-sans text-sm text-muted mt-1 truncate">{data.author}</p>
            </div>
          </Link>
        ) : null
      )}
    </aside>
  );
}
