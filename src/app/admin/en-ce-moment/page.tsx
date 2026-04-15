import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CurrentReadForm } from "@/components/admin/CurrentReadForm";

export const metadata: Metadata = { title: "En ce moment — Admin" };

async function getCurrentReads() {
  return prisma.currentRead.findMany().catch(() => []);
}

export default async function EnCeMomentPage() {
  const reads = await getCurrentReads();
  const nanou  = reads.find((r) => r.reader === "nanou");
  const cassie = reads.find((r) => r.reader === "cassie");

  return (
    <div className="px-6 py-10 max-w-2xl">
      <div className="mb-10">
        <h1 className="font-serif text-3xl font-normal">En ce moment</h1>
        <p className="font-sans text-sm text-muted mt-0.5">
          Ce que lisent Nawal et Cassie — affiché sur la page À propos.
        </p>
      </div>

      <div className="space-y-6">
        <CurrentReadForm
          reader="nanou"
          label="Nawal lit…"
          initial={nanou ?? null}
        />
        <CurrentReadForm
          reader="cassie"
          label="Cassie lit…"
          initial={cassie ?? null}
        />
      </div>
    </div>
  );
}
