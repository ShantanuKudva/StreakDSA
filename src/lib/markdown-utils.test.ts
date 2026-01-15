import { describe, it, expect } from "vitest";
import { convertFromPlainText } from "./markdown-utils";

describe("convertFromPlainText", () => {
    it("converts simple text correctly", async () => {
        const input = "<p>Hello World</p>";
        const result = await convertFromPlainText(input);
        // Marked often wraps simple text in <p>
        expect(result.trim()).toBe("<p>Hello World</p>");
    });

    it("converts HTML-wrapped headers to actual headers", async () => {
        const input = "<p>## Core Idea</p>";
        const result = await convertFromPlainText(input);
        expect(result.trim()).toBe("<h2>Core Idea</h2>");
    });

    it("converts HTML-wrapped blockquotes", async () => {
        const input = "<p>&gt; This is a quote</p>";
        // Turndown should see "> This is a quote"
        const result = await convertFromPlainText(input);
        expect(result.trim()).toContain("<blockquote>");
        expect(result.trim()).toContain("This is a quote");
    });

    it("converts bold text correctly", async () => {
        const input = "<p>**Bold Text**</p>";
        const result = await convertFromPlainText(input);
        expect(result.trim()).toContain("<strong>Bold Text</strong>");
    });

    it("handles multiple lines of pasted markdown", async () => {
        const input = `
      <p>## Header</p>
      <p>Paragraph</p>
      <p>- List item</p>
    `;
        const result = await convertFromPlainText(input);
        expect(result).toContain("<h2>Header</h2>");
        expect(result).toContain("<p>Paragraph</p>");
        expect(result).toContain("<ul>");
        expect(result).toContain("<li>List item</li>");
    });

    it("handles the user specific case", async () => {
        const input = `<p></p>\n<p>## Core Idea (1 sentence)</p>\n<p>&gt; <strong>Pick a pivot, move smaller elements to the left, larger to the right,</strong></p>\n<p><strong>then repeat on both sides.</strong></p>`;
        const result = await convertFromPlainText(input);
        expect(result).toContain("<h2>Core Idea (1 sentence)</h2>");
        expect(result).toContain("<blockquote>");
    });
});
