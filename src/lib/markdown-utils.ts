import { marked } from "marked";
import TurndownService from "turndown";

/**
 * Converts "HTML-wrapped Markdown" (often pasted into contenteditable areas)
 * into clean, valid HTML that Tiptap can consume as rich text.
 * 
 * Example: 
 * Input: <p>## Title</p>
 * Process: 
 *   1. Turndown -> \## Title (escaped text)
 *   2. Unescape -> ## Title
 *   3. Marked -> <h2>Title</h2>
 */
export async function convertFromPlainText(text: string): Promise<string> {
    // 1. Convert HTML input to Markdown (handling potentially wrapped content)
    const turndownService = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
        emDelimiter: "*",
        bulletListMarker: "-",
    });

    const cleanMarkdown = turndownService.turndown(text);

    // 2. Unescape Markdown characters that Turndown protected
    // Turndown assumes input text was literal, so it escapes #, *, etc.
    // We want to treat them as syntax.
    const unescapedMarkdown = cleanMarkdown.replace(/\\([#>\-*_.+`!\[\]()])/g, '$1');

    // 3. Convert clean Markdown to HTML
    const html = await marked.parse(unescapedMarkdown, { async: true });

    return html;
}
