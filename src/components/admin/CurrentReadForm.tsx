"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { upsertCurrentRead } from "@/actions/currentReads";
import { uploadImage } from "@/lib/storage";
import { Loader2, Upload } from "lucide-react";

interface CurrentReadFormProps {
  reader: "nanou" | "cassie";
  label: string;
  initial?: { title: string; author: string; coverImage: string | null } | null;
}

export function CurrentReadForm({ reader, label, initial }: CurrentReadFormProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle]       = useState(initial?.title ?? "");
  const [author, setAuthor]     = useState(initial?.author ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [uploading, setUploading]   = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file, "covers");
      setCoverImage(url);
    } catch {
      setError("Échec de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const formData = new FormData();
    formData.set("reader", reader);
    formData.set("title", title);
    formData.set("author", author);
    formData.set("coverImage", coverImage);

    startTransition(async () => {
      try {
        await upsertCurrentRead(formData);
        setSaved(true);
      } catch {
        setError("Une erreur est survenue.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card border rounded-xl p-6 space-y-4">
      <h2 className="font-serif text-xl font-normal text-accent">{label}</h2>

      {/* Couverture */}
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-16 h-24 rounded overflow-hidden border border-border bg-border/20">
          {coverImage ? (
            <Image src={coverImage} alt="Couverture" width={64} height={96} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Upload size={16} className="text-muted" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="admin-btn-secondary text-sm"
          >
            {uploading
              ? <><Loader2 size={13} className="animate-spin inline mr-1" />Upload…</>
              : coverImage ? "Changer" : "Ajouter une couverture"}
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
        <input
          ref={fileInputRef}
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

      {/* Titre */}
      <div>
        <label className="admin-label">Titre du livre</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Le Nom du vent"
          className="admin-input"
        />
      </div>

      {/* Auteur */}
      <div>
        <label className="admin-label">Auteur·ice</label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          placeholder="Patrick Rothfuss"
          className="admin-input"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {error && <p className="font-sans text-sm text-red-400">{error}</p>}
        {saved && <p className="font-sans text-sm text-green-400">Sauvegardé ✓</p>}
        <button type="submit" disabled={isPending} className="admin-btn-primary">
          {isPending
            ? <><Loader2 size={13} className="animate-spin inline mr-1.5" />Enregistrement…</>
            : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
