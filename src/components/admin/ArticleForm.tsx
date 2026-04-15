"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import { createArticle, updateArticle } from "@/actions/articles";
import { uploadImage } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { Article, Category } from "@/types/database";
import { Loader2, Upload } from "lucide-react";

type ArticleWithCategory = Article & { category: Category | null };

interface ArticleFormProps {
  article?: ArticleWithCategory;
  categories: Category[];
}

// Generate a URL-friendly slug from a title
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function ArticleForm({ article, categories }: ArticleFormProps) {
  const isEditing = !!article;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(isEditing);
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [tags, setTags] = useState(article?.tags.join(", ") ?? "");
  const [categoryId, setCategoryId] = useState(article?.categoryId ?? "");
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    (article?.status as "DRAFT" | "PUBLISHED") ?? "DRAFT"
  );
  const [content, setContent] = useState(article?.content ?? "");
  const [uploadingCover, setUploadingCover] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugEdited) setSlug(slugify(val));
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    try {
      const url = await uploadImage(file, "covers");
      setCoverImage(url);
    } catch {
      setError("Échec de l'upload de la couverture.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("excerpt", excerpt);
    formData.set("content", content);
    formData.set("categoryId", categoryId);
    formData.set("coverImage", coverImage);
    formData.set("tags", tags);
    formData.set("status", status);

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateArticle(article!.id, formData);
          setSaved(true);
        } else {
          await createArticle(formData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ─── Titre ─── */}
      <div>
        <label className="admin-label">Titre</label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          placeholder="Titre de la chronique"
          className="admin-input text-xl font-serif"
        />
      </div>

      {/* ─── Slug ─── */}
      <div>
        <label className="admin-label">Slug (URL)</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
          required
          placeholder="mon-article"
          className="admin-input font-mono text-sm"
        />
      </div>

      {/* ─── Excerpt ─── */}
      <div>
        <label className="admin-label">Extrait</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="Un bref résumé affiché dans les listes…"
          className="admin-input resize-none"
        />
      </div>

      {/* ─── Catégorie + Tags ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Catégorie</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="admin-input"
          >
            <option value="">Sans catégorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="admin-label">Tags (séparés par des virgules)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="fantasy, roman, 2024"
            className="admin-input"
          />
        </div>
      </div>

      {/* ─── Image de couverture ─── */}
      <div>
        <label className="admin-label">Image de couverture</label>
        <div className="flex items-start gap-4">
          {coverImage ? (
            <div className="relative w-32 h-20 rounded-md overflow-hidden border border-border shrink-0">
              <Image src={coverImage} alt="Couverture" fill className="object-cover" />
            </div>
          ) : (
            <div className="w-32 h-20 rounded-md border border-dashed border-border bg-surface/30 flex items-center justify-center shrink-0">
              <Upload size={18} className="text-muted" />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="admin-btn-secondary text-sm"
            >
              {uploadingCover ? (
                <><Loader2 size={14} className="animate-spin inline mr-1" />Upload…</>
              ) : coverImage ? "Changer l'image" : "Choisir une image"}
            </button>
            {coverImage && (
              <button
                type="button"
                onClick={() => setCoverImage("")}
                className="font-sans text-xs text-muted hover:text-foreground transition-colors"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleCoverUpload(file);
            e.target.value = "";
          }}
        />
      </div>

      {/* ─── Éditeur Tiptap ─── */}
      <div>
        <label className="admin-label">Contenu</label>
        <TiptapEditor content={content} onChange={setContent} />
      </div>

      {/* ─── Actions ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-3">
          <span className="font-sans text-sm text-muted">Statut :</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="DRAFT"
              checked={status === "DRAFT"}
              onChange={() => setStatus("DRAFT")}
              className="accent-accent"
            />
            <span className="font-sans text-sm text-muted">Brouillon</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="PUBLISHED"
              checked={status === "PUBLISHED"}
              onChange={() => setStatus("PUBLISHED")}
              className="accent-accent"
            />
            <span className="font-sans text-sm text-foreground">Publié</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          {error && <p className="font-sans text-sm text-red-400">{error}</p>}
          {saved && <p className="font-sans text-sm text-green-400">Sauvegardé ✓</p>}
          <button type="submit" disabled={isPending} className="admin-btn-primary">
            {isPending ? (
              <><Loader2 size={14} className="animate-spin inline mr-1.5" />Enregistrement…</>
            ) : isEditing ? "Enregistrer" : "Créer la chronique"}
          </button>
        </div>
      </div>
    </form>
  );
}
