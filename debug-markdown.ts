import { marked } from "marked";
import TurndownService from "turndown";

const htmlInput = "<h1>Title</h1><p>Paragraph</p>";
const turndownService = new TurndownService({ headingStyle: "atx" });
const md = turndownService.turndown(htmlInput);
console.log("Markdown from HTML:", md);

const mdInput = "## Header 2\n\n> Blockquote";
const htmlOutput = marked.parse(mdInput);
console.log("HTML from Markdown:", htmlOutput);
