import React, { useEffect, useMemo, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "../utils/helpers";
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
} from "lucide-react";

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
  placeholder = "",
  id,
}) => {
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
            name: fieldName, // name prop'unu kullan (postDescription veya qualifications)
            value: html,
          },
        };
        onChange(event);
      }
    },
    [onChange, fieldName],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-blue-600 dark:text-orange-400 underline",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "",
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: handleUpdate,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-2",
          "prose-headings:font-bold prose-p:my-2 prose-ul:my-2 prose-ol:my-2",
          "prose > *:first-child:mt-0",
          "rich-html-content text-gray-900",
          error && "border-red-500",
        ),
      },
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label
          htmlFor={editorId}
          className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={cn(
          "rounded-lg border transition-colors bg-white dark:bg-gray-800",
          error
            ? "border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500"
            : "border-gray-300 dark:border-gray-600 focus-within:border-blue-500 dark:focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-orange-500",
          disabled && "bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60",
        )}
      >
        {/* Toolbar */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap gap-1">
          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive("bold") && "bg-gray-200 dark:bg-gray-600",
            )}
            title="Kalın"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive("italic") && "bg-gray-200 dark:bg-gray-600",
            )}
            title="İtalik"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive("strike") && "bg-gray-200 dark:bg-gray-600",
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
              editor.isActive("bulletList") && "bg-gray-200 dark:bg-gray-600",
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
              editor.isActive("orderedList") && "bg-gray-200 dark:bg-gray-600",
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
              editor.isActive({ textAlign: "left" }) && "bg-gray-200 dark:bg-gray-600",
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
              editor.isActive({ textAlign: "center" }) && "bg-gray-200 dark:bg-gray-600",
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
              editor.isActive({ textAlign: "right" }) && "bg-gray-200 dark:bg-gray-600",
            )}
            title="Sağa Hizala"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Link */}
          <button
            type="button"
            onClick={() => {
              const url = window.prompt("Link URL'si girin:");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive("link") && "bg-gray-200 dark:bg-gray-600",
            )}
            title="Link Ekle"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Undo/Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Geri Al"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Yinele"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Editor Content */}
        <EditorContent
          editor={editor}
          className={cn(
            "min-h-[200px] max-h-[400px] overflow-y-auto",
            disabled && "pointer-events-none",
          )}
        />
      </div>

      {error && (
        <p
          id={`${editorId}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={`${editorId}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default RichTextEditor;
