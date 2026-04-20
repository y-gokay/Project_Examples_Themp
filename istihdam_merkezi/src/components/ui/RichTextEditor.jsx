import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "../../utils/helpers";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Undo,
  Redo,
  X,
} from "lucide-react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";

/**
 * Rich Text Editor Component (Tiptap wrapper)
 * @param {Object} props
 * @param {string} props.value - Editor value (HTML string)
 * @param {Function} props.onChange - Change handler
 * @param {string} props.name - Field name (for form handling)
 * @param {string} props.label - Label text
 * @param {string} props.error - Error message
 * @param {string} props.helperText - Helper text
 * @param {string} props.className - Additional classes
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.maxLength - Maximum character count
 */
const RichTextEditor = ({
  value = "",
  onChange,
  name,
  label,
  error,
  helperText,
  className = "",
  required = false,
  disabled = false,
  placeholder = "Metninizi buraya yazın...",
  id,
  maxLength,
}) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [isEditingLink, setIsEditingLink] = useState(false);

  // editorId'yi sabitle (her render'da yeni ID oluşturma)
  const editorId = useMemo(() => {
    return id || `editor-${Math.random().toString(36).substr(2, 9)}`;
  }, [id]);

  // name prop'u varsa onu kullan, yoksa editorId kullan - useMemo ile sabitle
  const fieldName = useMemo(() => {
    return name || editorId;
  }, [name, editorId]);

  // onUpdate callback'ini useCallback ile sabitle - closure sorununu önler
  const handleUpdate = useCallback(
    ({ editor }) => {
      const html = editor.getHTML();
      if (onChange && fieldName) {
        const event = {
          target: {
            name: fieldName,
            value: html,
          },
        };
        onChange(event);
      }
    },
    [onChange, fieldName]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Başlık özelliğini devre dışı bırak
      }),
      Color,
      TextAlign.configure({
        types: ["paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Metninizi buraya yazın...",
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: handleUpdate,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3",
          "prose-p:my-1 prose-ul:my-2 prose-ol:my-2",
          "prose > *:first-child:mt-0 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline",
          "prose-a:hover:text-blue-800 dark:prose-a:hover:text-blue-300",
          "[&_p]:min-h-[1.5em] [&_p]:block",
          "dark:prose-invert dark:text-gray-100",
          error && "border-red-500"
        ),
        "data-placeholder": placeholder || "Metninizi buraya yazın...",
      },
      handleKeyDown: (view, event) => {
        // Enter tuşu için normal davranışı sağla
        // TipTap varsayılan olarak Enter'a basıldığında yeni paragraf oluşturur
        // false döndürerek varsayılan davranışı kullanıyoruz
        return false;
      },
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  // Karakter ve kelime sayısı
  const characterCount = useMemo(() => {
    if (!editor) return { characters: 0, words: 0 };
    const text = editor.getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return {
      characters: text.length,
      words,
    };
  }, [editor?.state.doc.content]);

  // Link ekleme/düzenleme fonksiyonu
  const handleLinkClick = useCallback(() => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    const linkAttributes = editor.getAttributes("link");

    if (linkAttributes.href) {
      // Mevcut linki düzenle
      setIsEditingLink(true);
      setLinkUrl(linkAttributes.href);
      setLinkText(selectedText || linkAttributes.href);
    } else {
      // Yeni link ekle
      setIsEditingLink(false);
      setLinkUrl("");
      setLinkText(selectedText);
    }
    setIsLinkModalOpen(true);
  }, [editor]);

  // Link kaydet
  const handleSaveLink = useCallback(() => {
    if (!editor || !linkUrl.trim()) return;

    if (linkText.trim()) {
      // Seçili metni link ile değiştir
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${linkUrl}">${linkText}</a>`)
        .run();
    } else {
      // Seçili metne link ekle veya URL'yi link olarak ekle
      if (isEditingLink) {
        editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
      } else {
        editor.chain().focus().setLink({ href: linkUrl }).run();
      }
    }

    setIsLinkModalOpen(false);
    setLinkUrl("");
    setLinkText("");
    setIsEditingLink(false);
  }, [editor, linkUrl, linkText, isEditingLink]);

  // Link kaldır
  const handleRemoveLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setIsLinkModalOpen(false);
    setLinkUrl("");
    setLinkText("");
    setIsEditingLink(false);
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label
          htmlFor={editorId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={cn(
          "rounded-lg border transition-colors bg-white dark:bg-gray-800",
          error
            ? "border-red-500 dark:border-red-600 focus-within:border-red-500 dark:focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-500 dark:focus-within:ring-red-600"
            : "border-gray-300 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400",
          disabled && "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60"
        )}
      >
        {/* Toolbar */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap items-center gap-1 bg-gray-50 dark:bg-gray-900">
          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive("bold") && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
            )}
            title="Kalın (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive("italic") && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
            )}
            title="İtalik (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive("strike") && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
            )}
            title="Üstü Çizili"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive("bulletList") && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
            )}
            title="Madde İşareti"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive("orderedList") && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
            )}
            title="Numaralı Liste"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive({ textAlign: "left" }) && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
            )}
            title="Sola Hizala"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive({ textAlign: "center" }) && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
            )}
            title="Ortala"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive({ textAlign: "right" }) && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
            )}
            title="Sağa Hizala"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Link */}
          <button
            type="button"
            onClick={handleLinkClick}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive("link") && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
            )}
            title="Link Ekle/Düzenle"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          {editor.isActive("link") && (
            <button
              type="button"
              onClick={handleRemoveLink}
              className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
              title="Linki Kaldır"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex-1" />

          {/* Undo/Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Geri Al (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Yinele (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Editor Content */}
        <EditorContent
          editor={editor}
          className={cn(
            "min-h-[200px] max-h-[500px] overflow-y-auto",
            disabled && "pointer-events-none"
          )}
        />

        {/* Footer - Character/Word Count */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <span>
              {characterCount.characters} karakter
              {maxLength && ` / ${maxLength}`}
            </span>
            <span>{characterCount.words} kelime</span>
          </div>
          {maxLength && characterCount.characters > maxLength && (
            <span className="text-red-600 dark:text-red-400 font-medium">
              Limit aşıldı!
            </span>
          )}
        </div>
      </div>

      {/* Link Modal */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false);
          setLinkUrl("");
          setLinkText("");
          setIsEditingLink(false);
        }}
        title={isEditingLink ? "Linki Düzenle" : "Link Ekle"}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="URL"
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            required
            helperText="Link adresini girin"
          />
          <Input
            label="Link Metni (Opsiyonel)"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="Görüntülenecek metin"
            helperText="Boş bırakılırsa URL gösterilir"
          />
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          {isEditingLink && (
            <Button
              variant="outline"
              onClick={handleRemoveLink}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:border-red-500 dark:hover:border-red-600"
            >
              Linki Kaldır
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setIsLinkModalOpen(false);
              setLinkUrl("");
              setLinkText("");
              setIsEditingLink(false);
            }}
          >
            İptal
          </Button>
          <Button onClick={handleSaveLink} disabled={!linkUrl.trim()}>
            {isEditingLink ? "Güncelle" : "Ekle"}
          </Button>
        </div>
      </Modal>

      {error && (
        <p
          id={`${editorId}-error`}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={`${editorId}-helper`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default RichTextEditor;
