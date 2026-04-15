"use client";

import { deleteArticle } from "@/actions/articles";
import { Trash2 } from "lucide-react";

export function DeleteButton({ id, title }: { id: string; title: string }) {
  const action = deleteArticle.bind(null, id);

  return (
    <form action={action}>
      <button
        type="submit"
        title="Supprimer"
        className="p-1.5 rounded text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
        onClick={(e) => {
          if (!window.confirm(`Supprimer « ${title} » ? Cette action est irréversible.`)) {
            e.preventDefault();
          }
        }}
      >
        <Trash2 size={14} />
      </button>
    </form>
  );
}
