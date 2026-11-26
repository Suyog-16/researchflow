import React, { useState, useRef } from "react";

// ─── Inline Token Parser for Preview ──────────────────────────────────────────
function renderInlineTokens(text) {
  if (!text) return null;

  const tokenRegex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|(?<!\*)\*[^*]+\*(?!\*)|`[^`]+`|~~[^~]+~~|\$[^$]+\$|\[H\d+\]|\[[^\]]+\]\([^)]+\)|(?<=\s|^)#[a-zA-Z0-9_-]+)/g;

  const parts = text.split(tokenRegex);
  return parts.map((part, i) => {
    if (!part) return null;

    if (part.startsWith("***") && part.endsWith("***") && part.length > 6) {
      return (
        <strong key={i} className="font-bold italic text-amber-200">
          {part.slice(3, -3)}
        </strong>
      );
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-bold text-[#f4f4f6]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={i} className="italic text-[#d4d4d8]">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-[#1c1c26] text-amber-300 border border-[#2e2e3e] text-[11px] font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("~~") && part.endsWith("~~") && part.length > 4) {
      return (
        <del key={i} className="line-through text-[#71717a]">
          {part.slice(2, -2)}
        </del>
      );
    }
    if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
      return (
        <span
          key={i}
          className="px-1.5 py-0.2 rounded bg-sky-950/40 text-sky-300 border border-sky-800/40 font-mono text-[11px]"
          title="LaTeX Math"
        >
          {part.slice(1, -1)}
        </span>
      );
    }
    if (part.startsWith("[H") && part.endsWith("]")) {
      return (
        <span
          key={i}
          className="inline-block px-1.5 py-0.2 mx-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 text-[10px] font-mono select-none"
        >
          {part}
        </span>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
          className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
          onClick={(e) => e.stopPropagation()}
        >
          {linkMatch[1]}
        </a>
      );
    }
    if (part.startsWith("#") && part.length > 1) {
      return (
        <span
          key={i}
          className="px-1.5 py-0.2 rounded bg-[#1c1c24] text-amber-400 border border-[#2a2a36] text-[10px]"
        >
          {part}
        </span>
      );
    }

    return <span key={i}>{part}</span>;
  });
}

// ─── Preview Renderer ─────────────────────────────────────────────────────────
function MarkdownPreview({ content }) {
  if (!content || !content.trim()) {
    return (
      <div className="p-4 text-[#52525b] italic text-xs font-mono">
        // No notes entered yet. Switch to Write tab to add notes.
      </div>
    );
  }

  const lines = content.split("\n");

  return (
    <div className="p-4 space-y-1.5 font-serif text-[13.5px] leading-relaxed text-[#f4f4f6] overflow-y-auto h-full">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-3" />;
        }

        if (/^#\s+/.test(line)) {
          return (
            <h1 key={idx} className="font-serif text-lg font-bold text-[#f4f4f6] border-b border-[#262634] pb-1 mt-2 mb-1 tracking-tight">
              {renderInlineTokens(line.replace(/^#\s+/, ""))}
            </h1>
          );
        }

        if (/^##\s+/.test(line)) {
          return (
            <h2 key={idx} className="font-serif text-base font-bold text-amber-400 mt-2 mb-0.5 tracking-tight">
              {renderInlineTokens(line.replace(/^##\s+/, ""))}
            </h2>
          );
        }

        if (/^###\s+/.test(line)) {
          return (
            <h3 key={idx} className="font-serif text-sm font-semibold text-[#f4f4f6] mt-1.5 mb-0.5">
              {renderInlineTokens(line.replace(/^###\s+/, ""))}
            </h3>
          );
        }

        if (/^####\s+/.test(line)) {
          return (
            <h4 key={idx} className="font-serif text-xs font-semibold text-amber-300 mt-1 mb-0.5">
              {renderInlineTokens(line.replace(/^####\s+/, ""))}
            </h4>
          );
        }

        if (/^([-*_]){3,}$/.test(trimmed)) {
          return <hr key={idx} className="border-[#262634] my-2" />;
        }

        if (/^>\s*/.test(line)) {
          return (
            <blockquote key={idx} className="border-l-2 border-amber-500/60 pl-2.5 py-0.5 text-[#a1a1aa] italic bg-[#14141c]/50 rounded-r my-0.5 text-xs font-sans">
              {renderInlineTokens(line.replace(/^>\s*/, ""))}
            </blockquote>
          );
        }

        const taskMatch = line.match(/^(\s*[-*]\s*\[([ xX])\])\s*(.*)$/);
        if (taskMatch) {
          const isChecked = taskMatch[2].toLowerCase() === "x";
          return (
            <div key={idx} className="flex items-start gap-2 my-0.5 text-[13px] font-sans">
              <span className={`select-none font-bold font-mono ${isChecked ? "text-emerald-400" : "text-[#71717a]"}`}>
                {isChecked ? "[✓]" : "[ ]"}
              </span>
              <span className={isChecked ? "line-through text-[#71717a]" : "text-[#f4f4f6]"}>
                {renderInlineTokens(taskMatch[3])}
              </span>
            </div>
          );
        }

        const bulletMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
        if (bulletMatch) {
          const indent = bulletMatch[1].length;
          return (
            <div key={idx} style={{ paddingLeft: `${indent * 8 + 4}px` }} className="flex items-start gap-2 my-0.5 text-[13px] font-serif">
              <span className="text-amber-500 font-bold shrink-0 select-none">•</span>
              <span className="flex-1 text-[#f4f4f6]">{renderInlineTokens(bulletMatch[3])}</span>
            </div>
          );
        }

        const numMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
        if (numMatch) {
          const indent = numMatch[1].length;
          return (
            <div key={idx} style={{ paddingLeft: `${indent * 8 + 4}px` }} className="flex items-start gap-2 my-0.5 text-[13px] font-serif">
              <span className="text-amber-400 font-mono text-[11px] shrink-0 select-none">{numMatch[2]}.</span>
              <span className="flex-1 text-[#f4f4f6]">{renderInlineTokens(numMatch[3])}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="text-[13.5px] leading-[1.8] text-[#e4e4e7] my-0.5 font-serif">
            {renderInlineTokens(line)}
          </p>
        );
      })}
    </div>
  );
}

// ─── Normal Textarea with Formatting Toolbar (Headings & Bold) ────────────────
export function MarkdownLiveEditor({ value = "", onChange, placeholder = "Start recording synthesis notes, derivations, and summaries..." }) {
  const [tab, setTab] = useState("write"); // "write" | "preview"
  const textareaRef = useRef(null);

  // Apply formatting (Bold, Italic, Headings, Lists, etc.)
  const applyFormat = (type) => {
    // If in preview, switch to write mode
    if (tab !== "write") setTab("write");

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selectedText = currentText.slice(start, end);

    let replacement = "";
    let cursorStart = start;
    let cursorEnd = end;

    // ── BOLD: wrap or insert ────────────────────────────────────────────────
    if (type === "bold") {
      if (selectedText) {
        replacement = `**${selectedText}**`;
        cursorStart = start;
        cursorEnd = end + 4;
      } else {
        replacement = "**bold text**";
        cursorStart = start + 2;
        cursorEnd = start + 11;
      }
      const updated = currentText.slice(0, start) + replacement + currentText.slice(end);
      onChange(updated);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(cursorStart, cursorEnd);
      }, 10);
      return;
    }

    // ── ITALIC: wrap or insert ──────────────────────────────────────────────
    if (type === "italic") {
      if (selectedText) {
        replacement = `*${selectedText}*`;
        cursorStart = start;
        cursorEnd = end + 2;
      } else {
        replacement = "*italic text*";
        cursorStart = start + 1;
        cursorEnd = start + 12;
      }
      const updated = currentText.slice(0, start) + replacement + currentText.slice(end);
      onChange(updated);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(cursorStart, cursorEnd);
      }, 10);
      return;
    }

    // ── INLINE CODE ─────────────────────────────────────────────────────────
    if (type === "code") {
      if (selectedText) {
        replacement = `\`${selectedText}\``;
        cursorStart = start;
        cursorEnd = end + 2;
      } else {
        replacement = "`code`";
        cursorStart = start + 1;
        cursorEnd = start + 5;
      }
      const updated = currentText.slice(0, start) + replacement + currentText.slice(end);
      onChange(updated);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(cursorStart, cursorEnd);
      }, 10);
      return;
    }

    // ── LINE-LEVEL FORMATTING: Headings (#, ##, ###), Bullets, Quotes ───────
    const lineStart = currentText.lastIndexOf("\n", start - 1) + 1;
    let lineEnd = currentText.indexOf("\n", end);
    if (lineEnd === -1) lineEnd = currentText.length;

    const blockText = currentText.slice(lineStart, lineEnd);
    const blockLines = blockText.split("\n");

    let prefix = "";
    if (type === "h1") prefix = "# ";
    if (type === "h2") prefix = "## ";
    if (type === "h3") prefix = "### ";
    if (type === "bullet") prefix = "- ";
    if (type === "number") prefix = "1. ";
    if (type === "quote") prefix = "> ";

    const newBlockLines = blockLines.map((line, i) => {
      // If heading: replace any existing heading prefix
      if (type.startsWith("h")) {
        const clean = line.replace(/^#{1,6}\s*/, "");
        return `${prefix}${clean}`;
      }
      if (type === "bullet") {
        const clean = line.replace(/^[-*+]\s*/, "");
        return `${prefix}${clean}`;
      }
      if (type === "number") {
        const clean = line.replace(/^\d+\.\s*/, "");
        return `${i + 1}. ${clean}`;
      }
      if (type === "quote") {
        const clean = line.replace(/^>\s*/, "");
        return `${prefix}${clean}`;
      }
      return `${prefix}${line}`;
    });

    const newBlockText = newBlockLines.join("\n");
    const updated = currentText.slice(0, lineStart) + newBlockText + currentText.slice(lineEnd);
    onChange(updated);

    setTimeout(() => {
      textarea.focus();
      const lengthDelta = newBlockText.length - blockText.length;
      textarea.setSelectionRange(lineStart, lineEnd + lengthDelta);
    }, 10);
  };

  // Keyboard shortcuts (Ctrl+B, Ctrl+I, Tab)
  const handleKeyDown = (e) => {
    // Bold: Ctrl+B or Cmd+B
    if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
      e.preventDefault();
      applyFormat("bold");
      return;
    }

    // Italic: Ctrl+I or Cmd+I
    if ((e.ctrlKey || e.metaKey) && (e.key === "i" || e.key === "I")) {
      e.preventDefault();
      applyFormat("italic");
      return;
    }

    // Tab key inserts 2 spaces
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const current = textarea.value;
      const updated = current.slice(0, start) + "  " + current.slice(end);
      onChange(updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d10] font-mono text-xs">
      {/* ── Normal Formatting Toolbar ── */}
      <div className="px-3 py-1.5 border-b border-[#222228] bg-[#121217] flex items-center justify-between gap-2 shrink-0">
        {/* Formatting Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {/* Headings */}
          <div className="flex items-center bg-[#0e0e12] border border-[#262634] rounded-[2px] p-0.5">
            <button
              type="button"
              onClick={() => applyFormat("h1")}
              className="px-1.5 py-0.5 rounded-[1px] hover:bg-[#20202c] text-[#a1a1aa] hover:text-[#f4f4f6] font-bold text-[10px] cursor-pointer"
              title="Heading 1 (#)"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => applyFormat("h2")}
              className="px-1.5 py-0.5 rounded-[1px] hover:bg-[#20202c] text-[#a1a1aa] hover:text-amber-400 font-bold text-[10px] cursor-pointer"
              title="Heading 2 (##)"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => applyFormat("h3")}
              className="px-1.5 py-0.5 rounded-[1px] hover:bg-[#20202c] text-[#a1a1aa] hover:text-[#f4f4f6] font-semibold text-[10px] cursor-pointer"
              title="Heading 3 (###)"
            >
              H3
            </button>
          </div>

          {/* Bold & Italic */}
          <div className="flex items-center bg-[#0e0e12] border border-[#262634] rounded-[2px] p-0.5">
            <button
              type="button"
              onClick={() => applyFormat("bold")}
              className="px-2 py-0.5 rounded-[1px] hover:bg-[#20202c] text-[#f4f4f6] hover:text-amber-400 font-bold text-[11px] cursor-pointer"
              title="Bold (**text**) — Ctrl+B"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => applyFormat("italic")}
              className="px-2 py-0.5 rounded-[1px] hover:bg-[#20202c] text-[#a1a1aa] hover:text-[#f4f4f6] italic text-[11px] cursor-pointer"
              title="Italic (*text*) — Ctrl+I"
            >
              I
            </button>
          </div>

          {/* Lists & Quotes */}
          <div className="flex items-center bg-[#0e0e12] border border-[#262634] rounded-[2px] p-0.5">
            <button
              type="button"
              onClick={() => applyFormat("bullet")}
              className="px-1.5 py-0.5 rounded-[1px] hover:bg-[#20202c] text-[#a1a1aa] hover:text-[#f4f4f6] text-[10px] cursor-pointer"
              title="Bullet List (-)"
            >
              • List
            </button>
            <button
              type="button"
              onClick={() => applyFormat("number")}
              className="px-1.5 py-0.5 rounded-[1px] hover:bg-[#20202c] text-[#a1a1aa] hover:text-[#f4f4f6] text-[10px] cursor-pointer"
              title="Numbered List (1.)"
            >
              1. List
            </button>
            <button
              type="button"
              onClick={() => applyFormat("quote")}
              className="px-1.5 py-0.5 rounded-[1px] hover:bg-[#20202c] text-[#a1a1aa] hover:text-[#f4f4f6] text-[10px] cursor-pointer"
              title="Blockquote (>)"
            >
              &gt; Quote
            </button>
            <button
              type="button"
              onClick={() => applyFormat("code")}
              className="px-1.5 py-0.5 rounded-[1px] hover:bg-[#20202c] text-[#a1a1aa] hover:text-[#f4f4f6] font-mono text-[10px] cursor-pointer"
              title="Inline Code (`)"
            >
              `code`
            </button>
          </div>
        </div>

        {/* Write / Preview Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#0e0e12] border border-[#262634] p-0.5 rounded-[2px] shrink-0">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={`px-2 py-0.5 rounded-[1px] text-[10px] font-medium cursor-pointer transition-colors ${
              tab === "write"
                ? "bg-amber-500 text-black font-semibold"
                : "text-[#71717a] hover:text-[#f4f4f6]"
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`px-2 py-0.5 rounded-[1px] text-[10px] font-medium cursor-pointer transition-colors ${
              tab === "preview"
                ? "bg-amber-500 text-black font-semibold"
                : "text-[#71717a] hover:text-[#f4f4f6]"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* ── Editor Body: Normal Textarea (Write) or Formatted Markdown (Preview) ── */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === "write" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full flex-1 resize-none bg-transparent p-4 text-[13px] leading-[1.8] text-[#f4f4f6] focus:outline-none placeholder-[#52525b] font-mono overflow-y-auto"
            style={{ border: "none" }}
            spellCheck
          />
        ) : (
          <MarkdownPreview content={value} />
        )}
      </div>
    </div>
  );
}

export default MarkdownLiveEditor;
