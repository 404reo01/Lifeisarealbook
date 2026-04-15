"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Link2, ImagePlus, Undo2, Redo2,
  AlignLeft, AlignCenter, AlignRight, Unlink, Maximize2, Loader2,
} from "lucide-react";
import { uploadImage } from "@/lib/storage";
import { cn } from "@/lib/utils";

// Extend image with data-align attribute for positioning
const CustomImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") ?? "center",
        renderHTML: (attrs) => ({ "data-align": attrs.align }),
      },
    };
  },
});

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={cn(
        "p-1.5 rounded transition-colors duration-150",
        active
          ? "bg-accent/20 text-accent"
          : "text-muted hover:text-foreground hover:bg-border/40"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-1 self-center" />;
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage.configure({ HTMLAttributes: { class: "tiptap-img" } }),
      TiptapLink.configure({ openOnClick: false, HTMLAttributes: { class: "text-accent underline" } }),
      Placeholder.configure({ placeholder: "Commencez à écrire votre chronique…" }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "tiptap-editor outline-none min-h-[400px] px-6 py-5 prose-literary focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sync initial content if it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;
      setUploading(true);
      try {
        const url = await uploadImage(file, "covers");
        editor.chain().focus().setImage({ src: url }).run();
        // Set default alignment after insert
        editor.chain().focus().updateAttributes("image", { align: "center" }).run();
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  const setImageAlign = useCallback(
    (align: "left" | "center" | "right" | "full") => {
      if (!editor) return;
      editor.chain().focus().updateAttributes("image", { align }).run();
    },
    [editor]
  );

  const addLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL du lien", prev ?? "https://");
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="glass-card rounded-lg border overflow-hidden">
      {/* ─── Toolbar ─── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border/60 bg-surface/30">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Annuler">
          <Undo2 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Rétablir">
          <Redo2 size={15} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")} title="Gras"
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")} title="Italique"
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")} title="Barré"
        >
          <Strikethrough size={15} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })} title="Titre 1"
        >
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })} title="Titre 2"
        >
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })} title="Titre 3"
        >
          <Heading3 size={15} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")} title="Liste"
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")} title="Liste numérotée"
        >
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")} title="Citation"
        >
          <Quote size={15} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="Ajouter un lien">
          <Link2 size={15} />
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Supprimer le lien"
          >
            <Unlink size={15} />
          </ToolbarButton>
        )}
        <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Insérer une image">
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
        </ToolbarButton>

        <Divider />

        {editor.isActive("image") ? (
          // Image alignment toolbar — shown when an image is selected
          <>
            <ToolbarButton
              onClick={() => setImageAlign("left")}
              active={editor.getAttributes("image").align === "left"}
              title="Image à gauche"
            >
              <AlignLeft size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => setImageAlign("center")}
              active={editor.getAttributes("image").align === "center"}
              title="Image centrée"
            >
              <AlignCenter size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => setImageAlign("right")}
              active={editor.getAttributes("image").align === "right"}
              title="Image à droite"
            >
              <AlignRight size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => setImageAlign("full")}
              active={editor.getAttributes("image").align === "full"}
              title="Pleine largeur"
            >
              <Maximize2 size={15} />
            </ToolbarButton>
          </>
        ) : (
          // Text alignment toolbar — shown otherwise
          <>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              active={editor.isActive({ textAlign: "left" })} title="Aligner à gauche"
            >
              <AlignLeft size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              active={editor.isActive({ textAlign: "center" })} title="Centrer"
            >
              <AlignCenter size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              active={editor.isActive({ textAlign: "right" })} title="Aligner à droite"
            >
              <AlignRight size={15} />
            </ToolbarButton>
          </>
        )}
      </div>

      {/* ─── Éditeur ─── */}
      <EditorContent editor={editor} />

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
