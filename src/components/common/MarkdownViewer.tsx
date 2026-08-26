"use client";

import React, { useState } from "react";
import { Copy, Check, FileText, Code2, ExternalLink } from "lucide-react";

interface MarkdownViewerProps {
  content: string;
  title?: string;
  filename?: string;
  lastModified?: string;
}

export function MarkdownViewer({ content, title, filename, lastModified }: MarkdownViewerProps) {
  const [viewMode, setViewMode] = useState<"rendered" | "raw">("rendered");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple, safe, zero-dependency Markdown Parser to styled JSX
  const renderMarkdown = (raw: string) => {
    const lines = raw.split("\n");
    const elements: React.ReactNode[] = [];
    let inList: { type: "ul" | "ol"; items: React.ReactNode[] } | null = null;
    let inQuote: React.ReactNode[] = [];

    const flushList = () => {
      if (inList) {
        if (inList.type === "ul") {
          elements.push(
            <ul key={`ul-${elements.length}`} className="my-3 space-y-1.5 list-disc list-inside text-slate-300">
              {inList.items.map((item, idx) => (
                <li key={idx} className="leading-relaxed pl-1">
                  {item}
                </li>
              ))}
            </ul>
          );
        } else {
          elements.push(
            <ol key={`ol-${elements.length}`} className="my-3 space-y-1.5 list-decimal list-inside text-slate-300">
              {inList.items.map((item, idx) => (
                <li key={idx} className="leading-relaxed pl-1">
                  {item}
                </li>
              ))}
            </ol>
          );
        }
        inList = null;
      }
    };

    const flushQuote = () => {
      if (inQuote.length > 0) {
        elements.push(
          <div
            key={`quote-${elements.length}`}
            className="my-4 p-4 rounded-2xl bg-amber-500/10 border-l-4 border-amber-400 text-slate-200 shadow-sm space-y-1"
          >
            {inQuote}
          </div>
        );
        inQuote = [];
      }
    };

    const formatInline = (text: string): React.ReactNode => {
      // Split and parse inline tokens: links, bold, code, regular text
      // Regular expressions for inline tokens
      const tokenRegex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
      const parts = text.split(tokenRegex);

      return parts.map((part, index) => {
        if (!part) return null;

        // [text](url) link
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          const [, linkText, url] = linkMatch;
          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-amber-400 hover:text-amber-300 underline underline-offset-2 font-bold transition-colors"
            >
              <span>{linkText}</span>
              <ExternalLink className="w-3 h-3 inline-block ml-0.5 opacity-80" />
            </a>
          );
        }

        // **bold**
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-extrabold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }

        // `code`
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={index}
              className="px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 font-mono text-xs text-amber-300"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        // *italic*
        if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
          return (
            <em key={index} className="italic text-slate-300">
              {part.slice(1, -1)}
            </em>
          );
        }

        return <span key={index}>{part}</span>;
      });
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Horizontal Rule
      if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
        flushList();
        flushQuote();
        elements.push(<hr key={index} className="my-6 border-slate-800" />);
        return;
      }

      // Blockquotes (> text)
      if (trimmed.startsWith(">")) {
        flushList();
        const quoteText = trimmed.replace(/^>\s*/, "");
        inQuote.push(
          <p key={index} className="text-sm md:text-base leading-relaxed text-amber-100/90 font-medium">
            {formatInline(quoteText)}
          </p>
        );
        return;
      } else {
        flushQuote();
      }

      // Headings
      if (trimmed.startsWith("# ")) {
        flushList();
        elements.push(
          <h1 key={index} className="text-2xl md:text-3xl font-black text-white tracking-tight mt-6 mb-4">
            {formatInline(trimmed.replace(/^#\s+/, ""))}
          </h1>
        );
        return;
      }

      if (trimmed.startsWith("## ")) {
        flushList();
        elements.push(
          <h2 key={index} className="text-xl md:text-2xl font-black text-slate-100 tracking-tight mt-6 mb-3 border-b border-slate-800/80 pb-2">
            {formatInline(trimmed.replace(/^##\s+/, ""))}
          </h2>
        );
        return;
      }

      if (trimmed.startsWith("### ")) {
        flushList();
        elements.push(
          <h3 key={index} className="text-lg md:text-xl font-black text-amber-400 tracking-tight mt-5 mb-2">
            {formatInline(trimmed.replace(/^###\s+/, ""))}
          </h3>
        );
        return;
      }

      // Unordered lists (* or -)
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        const itemText = trimmed.replace(/^(\*|-)\s+/, "");
        if (!inList || inList.type !== "ul") {
          flushList();
          inList = { type: "ul", items: [] };
        }
        inList.items.push(formatInline(itemText));
        return;
      }

      // Ordered lists (1. 2. etc.)
      const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
      if (numMatch) {
        const itemText = numMatch[2];
        if (!inList || inList.type !== "ol") {
          flushList();
          inList = { type: "ol", items: [] };
        }
        inList.items.push(formatInline(itemText));
        return;
      }

      // Empty line
      if (!trimmed) {
        flushList();
        return;
      }

      // Standard Paragraph
      flushList();
      elements.push(
        <p key={index} className="my-2.5 text-sm md:text-base leading-relaxed text-slate-300">
          {formatInline(trimmed)}
        </p>
      );
    });

    flushList();
    flushQuote();
    return elements;
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-950/60 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white leading-tight">
              {title || "Markdown Document"}
            </h3>
            {filename && (
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                docs/parent-info/{filename}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
            <button
              onClick={() => setViewMode("rendered")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "rendered"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "raw"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Markdown</span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all active:scale-95 shadow-sm"
            title="Copy Raw Markdown"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Document Content */}
      <div className="p-6 md:p-8">
        {viewMode === "rendered" ? (
          <div className="prose prose-invert max-w-none">
            {renderMarkdown(content)}
          </div>
        ) : (
          <div className="relative">
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {content}
            </pre>
          </div>
        )}
      </div>

      {/* Footer Meta */}
      {lastModified && (
        <div className="px-6 py-3 bg-slate-950/40 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Source: Local Repository Markdown</span>
          <span>Last modified: {new Date(lastModified).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

