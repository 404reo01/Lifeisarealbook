"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autorisé");
  return user;
}

function parseTags(raw: string): string[] {
  return raw.split(",").map((t) => t.trim()).filter(Boolean);
}

export async function createArticle(formData: FormData) {
  const user = await requireAdmin();

  const status = formData.get("status") as "DRAFT" | "PUBLISHED";
  const categoryId = (formData.get("categoryId") as string) || null;

  const article = await prisma.article.create({
    data: {
      title:      formData.get("title") as string,
      slug:       formData.get("slug") as string,
      excerpt:    (formData.get("excerpt") as string) || null,
      content:    (formData.get("content") as string) || "",
      coverImage: (formData.get("coverImage") as string) || null,
      categoryId: categoryId || null,
      tags:       parseTags((formData.get("tags") as string) || ""),
      status,
      authorId:   user.id,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });

  revalidatePath("/chroniques");
  revalidatePath("/admin");
  redirect(`/admin/articles/${article.id}?saved=1`);
}

export async function updateArticle(id: string, formData: FormData) {
  await requireAdmin();

  const status = formData.get("status") as "DRAFT" | "PUBLISHED";
  const categoryId = (formData.get("categoryId") as string) || null;
  const existing = await prisma.article.findUnique({ where: { id } });

  await prisma.article.update({
    where: { id },
    data: {
      title:      formData.get("title") as string,
      slug:       formData.get("slug") as string,
      excerpt:    (formData.get("excerpt") as string) || null,
      content:    (formData.get("content") as string) || "",
      coverImage: (formData.get("coverImage") as string) || null,
      categoryId: categoryId || null,
      tags:       parseTags((formData.get("tags") as string) || ""),
      status,
      // Set publishedAt only on first publish
      publishedAt: status === "PUBLISHED" && !existing?.publishedAt
        ? new Date()
        : existing?.publishedAt ?? null,
    },
  });

  revalidatePath("/chroniques");
  revalidatePath("/admin");
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  await prisma.article.delete({ where: { id } });
  revalidatePath("/chroniques");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function togglePublish(id: string, currentStatus: string) {
  await requireAdmin();
  const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  await prisma.article.update({
    where: { id },
    data: {
      status: newStatus,
      publishedAt: newStatus === "PUBLISHED" ? new Date() : null,
    },
  });
  revalidatePath("/chroniques");
  revalidatePath("/admin");
}
