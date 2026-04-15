"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autorisé");
}

export async function upsertCurrentRead(formData: FormData) {
  await requireAdmin();

  const reader = formData.get("reader") as string;
  const title  = formData.get("title") as string;
  const author = formData.get("author") as string;
  const coverImage = (formData.get("coverImage") as string) || null;

  await prisma.currentRead.upsert({
    where: { reader },
    update: { title, author, coverImage },
    create: { reader, title, author, coverImage },
  });

  revalidatePath("/a-propos");
  revalidatePath("/admin/en-ce-moment");
}
