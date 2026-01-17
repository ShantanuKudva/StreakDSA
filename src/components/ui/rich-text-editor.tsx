"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import TurndownService from "turndown";
import { convertFromPlainText } from "@/lib/markdown-utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const Toolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  return (
    <div className="border-b border-white/5 p-2 flex flex-wrap gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("bold") && "bg-white/10 text-white"
        )}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("italic") && "bg-white/10 text-white"
        )}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("strike") && "bg-white/10 text-white"
        )}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-white/10 mx-1 self-center" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("heading", { level: 2 }) && "bg-white/10 text-white"
        )}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("codeBlock") && "bg-white/10 text-white"
        )}
      >
        <Code className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-white/10 mx-1 self-center" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("bulletList") && "bg-white/10 text-white"
        )}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("orderedList") && "bg-white/10 text-white"
        )}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("blockquote") && "bg-white/10 text-white"
        )}
      >
        <Quote className="h-4 w-4" />
      </Button>
    </div>
  );
};

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled,
}: RichTextEditorProps) {
  const [mode, setMode] = useState<"rich" | "plain">("rich");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || "Write something...",
        emptyEditorClass:
          "cursor-text before:content-[attr(data-placeholder)] before:absolute before:text-muted-foreground before:opacity-50 before:pointer-events-none",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (mode === "rich") {
        onChange(editor.getHTML());
      }
    },
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm prose-invert max-w-full focus:outline-none px-4 py-3 prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-code:text-purple-300 prose-code:bg-purple-500/10 prose-code:px-1 prose-code:rounded prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline",
      },
    },
    immediatelyRender: false,
  });

  // Sync content when switching modes
  // Sync content when switching modes
  const handleModeChange = (newMode: "rich" | "plain") => {
    setMode(newMode);
    if (newMode === "plain") {
      // HTML -> Markdown
      const turndownService = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
        emDelimiter: "*",
        bulletListMarker: "-",
      });
      const markdown = turndownService.turndown(value);
      setPlainText(markdown);
    } else {
      // Markdown -> HTML
      // If we are switching back to rich, we trust that `value` in parent is already updated via onChange
      if (editor) {
        editor.commands.setContent(value);
      }
    }
  };

  const [plainText, setPlainText] = useState("");

  // When value changes from outside (or initial), if in plain mode, we might need to sync?
  // Actually, if we control plainText, we only sync on init or mode switch.
  // We don't want external updates to overwrite user typing unless it's a reset.
  // For now, assume local control during plain mode.

  const handlePlainChange = async (text: string) => {
    setPlainText(text);
    try {
      const html = await convertFromPlainText(text);
      onChange(html);
    } catch (e) {
      console.error("[RichTextEditor] Markdown parse error:", e);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col border border-white/10 overflow-hidden rounded-md bg-[#1a1b1e]/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-2 py-1 shrink-0 h-9">
        <span className="text-xs text-muted-foreground font-medium px-2">
          {mode === "rich" ? "Rich Text" : "Plain Text"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleModeChange(mode === "rich" ? "plain" : "rich")}
          className="h-7 px-2 text-xs hover:bg-white/10"
          title={
            mode === "rich" ? "Switch to Plain Text" : "Switch to Rich Text"
          }
        >
          <Type className="mr-1.5 h-3.5 w-3.5" />
          Switch Editor
        </Button>
      </div>

      <div className="w-full overflow-y-auto h-[250px] bg-[#1a1b1e]/30">
        {mode === "rich" ? (
          <>
            <div className="sticky top-0 z-10 bg-[#1a1b1e] border-b border-white/5">
              <Toolbar editor={editor} />
            </div>
            <EditorContent editor={editor} className="min-h-full" />
          </>
        ) : (
          <Textarea
            value={plainText}
            onChange={(e) => handlePlainChange(e.target.value)}
            placeholder={placeholder}
            className="h-full w-full border-0 bg-transparent focus-visible:ring-0 rounded-none resize-none px-4 py-3 font-mono text-sm leading-relaxed"
          />
        )}
      </div>
    </div>
  );
}
