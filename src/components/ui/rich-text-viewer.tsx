"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface RichTextViewerProps {
    content: string;
    className?: string;
}

export function RichTextViewer({ content, className }: RichTextViewerProps) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: content,
        editable: false,
        editorProps: {
            attributes: {
                class:
                    "prose prose-sm prose-invert max-w-full focus:outline-none prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-code:text-purple-300 prose-code:bg-purple-500/10 prose-code:px-1 prose-code:rounded prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline",
            },
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) return null;

    return (
        <EditorContent
            editor={editor}
            className={cn("rich-text-viewer", className)}
        />
    );
}
