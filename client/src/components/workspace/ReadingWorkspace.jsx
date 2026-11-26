import React, { useState, useRef, useCallback } from "react";
import { HIGHLIGHT_CATEGORIES } from "../../data/mockData";
import PdfViewer from "./PdfViewer";
import MarkdownLiveEditor from "./MarkdownLiveEditor";

// ─── Highlight Item in sidebar ────────────────────────────────────────────────

function HighlightItem({ hl, onUpdateNote, onDelete }) {
  const [noteText, setNoteText] = useState(hl.note || "");
  const [expanded, setExpanded] = useState(false);
  const cat = HIGHLIGHT_CATEGORIES[hl.color] || HIGHLIGHT_CATEGORIES.yellow;

  const handleNoteBlur = () => {
    if (noteText !== hl.note) {
      onUpdateNote(hl.id, noteText);
    }
  };

  const dotColors = {
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444",
    blue: "#3b82f6",
  };

  return (
    <div className="border border-[#262632] rounded-[3px] bg-[#171720] mb-2 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-start gap-2 px-3 py-2 cursor-pointer hover:bg-[#1d1d28] select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <span
          className="mt-1 w-2 h-2 rounded-full shrink-0"
          style={{ background: dotColors[hl.color] || "#eab308" }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#d4d4d8] leading-snug line-clamp-2 font-mono">
            &ldquo;{hl.text}&rdquo;
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-[#71717a]">{cat.name}</span>
            {hl.pageNum && (
              <span className="text-[10px] text-[#52525b]">p.{hl.pageNum}</span>
            )}
            {hl.note && (
              <span className="text-[10px] text-amber-400/80 italic">// has note</span>
            )}
          </div>
        </div>
        <button
          type="button"
          className="text-[#52525b] hover:text-rose-400 cursor-pointer text-xs shrink-0 mt-0.5"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(hl.id);
          }}
          title="Delete highlight"
        >
          ✕
        </button>
      </div>

      {/* Expanded note editor */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-[#22222e] bg-[#13131a]">
          <label className="text-[10px] text-[#71717a] uppercase tracking-wide block mb-1">
            // Note
          </label>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onBlur={handleNoteBlur}
            rows={3}
            placeholder="Write commentary or question..."
            className="w-full resize-none text-xs text-[#f4f4f6] bg-[#0c0c10] border border-[#262634] rounded-[2px] px-2 py-1.5 focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}

// ─── Notes Panel ──────────────────────────────────────────────────────────────

function NotesPanel({ paper, notesText, onNotesChange, savedStatus, highlights }) {
  const [showHighlightsRef, setShowHighlightsRef] = useState(false);
  const wordCount = notesText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex flex-col h-full bg-[#0d0d10] font-sans text-xs">
      {/* Notes header */}
      <div className="px-3.5 pt-2.5 pb-2 border-b border-[#222228] shrink-0 bg-[#131317]">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-semibold text-[#71717a] font-mono uppercase tracking-wider">
            // Synthesis Notes
          </span>
          <span className="text-[10px] text-amber-400/80 font-mono">{savedStatus}</span>
        </div>
        <p className="text-xs font-serif font-medium text-[#a1a1aa] truncate">{paper.title}</p>
      </div>

      {/* Markdown Live Editor — Obsidian Style */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <MarkdownLiveEditor
          value={notesText}
          onChange={onNotesChange}
          placeholder="Start recording thoughts, derivations, and summaries..."
        />
      </div>

      {/* Footer: word count + highlights ref */}
      <div className="shrink-0 border-t border-[#222228] bg-[#111115]">
        {/* Highlights reference collapse */}
        {highlights.length > 0 && (
          <div className="border-b border-[#1c1c24]">
            <button
              type="button"
              onClick={() => setShowHighlightsRef((v) => !v)}
              className="w-full flex items-center justify-between px-3.5 py-1.5 text-[11px] text-[#71717a] hover:text-[#a1a1aa] cursor-pointer select-none"
            >
              <span>
                {highlights.length} highlight{highlights.length !== 1 ? "s" : ""} recorded
              </span>
              <span>{showHighlightsRef ? "▴" : "▾"}</span>
            </button>
            {showHighlightsRef && (
              <div className="px-3.5 pb-2.5 max-h-40 overflow-y-auto space-y-1">
                {highlights.map((hl) => {
                  const dotColors = {
                    green: "#22c55e",
                    yellow: "#eab308",
                    red: "#ef4444",
                    blue: "#3b82f6",
                  };
                  return (
                    <div
                      key={hl.id}
                      className="flex items-start gap-1.5 text-[11px] text-[#a1a1aa]"
                    >
                      <span
                        className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: dotColors[hl.color] || "#eab308" }}
                      />
                      <span className="line-clamp-1 italic">&ldquo;{hl.text}&rdquo;</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between px-3.5 py-1 text-[10px] text-[#52525b]">
          <span>{wordCount} words</span>
          <span>{savedStatus}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Highlights Panel ─────────────────────────────────────────────────────────

function HighlightsPanel({ highlights, onUpdateNote, onDelete }) {
  const colorOrder = ["green", "yellow", "red", "blue"];
  const grouped = colorOrder.reduce((acc, c) => {
    acc[c] = highlights.filter((h) => h.color === c);
    return acc;
  }, {});

  if (highlights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#52525b] text-xs px-6 text-center font-mono">
        <p className="leading-relaxed">
          &gt; No highlights yet.<br />Select text in the PDF to highlight.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 overflow-y-auto h-full font-mono">
      {colorOrder.map((color) => {
        const hls = grouped[color];
        if (!hls.length) return null;
        const cat = HIGHLIGHT_CATEGORIES[color];
        const dotColors = {
          green: "#22c55e",
          yellow: "#eab308",
          red: "#ef4444",
          blue: "#3b82f6",
        };
        return (
          <div key={color} className="mb-3">
            <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-[#71717a] font-semibold uppercase tracking-wide">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: dotColors[color] }}
              />
              <span>{cat.name} ({hls.length})</span>
            </div>
            {hls.map((hl) => (
              <HighlightItem
                key={hl.id}
                hl={hl}
                onUpdateNote={onUpdateNote}
                onDelete={onDelete}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── Reading Workspace ────────────────────────────────────────────────────────

export function ReadingWorkspace({ paper, onClose, onUpdatePaper }) {
  const [currentPage, setCurrentPage] = useState(paper.currentPage || 1);
  const totalPages = paper.totalPages || 14;

  const [scale, setScale] = useState(1.3);
  const zoomPct = Math.round(scale * 100);

  const [notesText, setNotesText] = useState(paper.notes || "");
  const [savedStatus, setSavedStatus] = useState("Saved");
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [readingStatus, setReadingStatus] = useState(paper.reading_status || "not read");

  const [highlights, setHighlights] = useState(() => {
    return (paper.highlights || []).map((h) => ({
      ...h,
      pageNum: h.pageNum || null,
    }));
  });

  const [sidebarTab, setSidebarTab] = useState("notes");
  const pdfViewerRef = useRef(null);

  // Sync to parent
  const syncUpdates = useCallback(
    (updates) => {
      setSavedStatus("Saving…");
      setTimeout(() => {
        setSavedStatus("Saved");
        onUpdatePaper(paper.id, updates);
      }, 500);
    },
    [paper.id, onUpdatePaper]
  );

  const handleNotesChange = useCallback(
    (text) => {
      setNotesText(text);
      syncUpdates({ notes: text });
    },
    [syncUpdates]
  );

  const handleStatusChange = useCallback(
    (status) => {
      setReadingStatus(status);
      syncUpdates({ reading_status: status });
    },
    [syncUpdates]
  );

  const handlePageChange = useCallback(
    (newPage) => {
      const p = Math.max(1, Math.min(totalPages, newPage));
      setCurrentPage(p);
      syncUpdates({ currentPage: p });
      pdfViewerRef.current?.scrollToPage(p);
    },
    [totalPages, syncUpdates]
  );

  const handleHighlightCreated = useCallback(
    (newHighlight) => {
      setHighlights((prev) => {
        const updated = [...prev, newHighlight];
        syncUpdates({ highlights: updated });
        return updated;
      });
      setSidebarTab("highlights");
    },
    [syncUpdates]
  );

  const handleUpdateHighlightNote = useCallback(
    (id, noteText) => {
      setHighlights((prev) => {
        const updated = prev.map((h) => (h.id === id ? { ...h, note: noteText } : h));
        syncUpdates({ highlights: updated });
        return updated;
      });
    },
    [syncUpdates]
  );

  const handleDeleteHighlight = useCallback(
    (id) => {
      setHighlights((prev) => {
        const updated = prev.filter((h) => h.id !== id);
        syncUpdates({ highlights: updated });
        return updated;
      });
    },
    [syncUpdates]
  );

  const copyBibtex = useCallback(() => {
    const firstAuthor = paper.authors[0]
      ? paper.authors[0].split(" ").pop().toLowerCase()
      : "author";
    const bibtex = `@article{${firstAuthor}${paper.publication_year},
  title = {${paper.title}},
  author = {${paper.authors.join(" and ")}},
  journal = {${paper.venue || "arXiv preprint"}},
  year = {${paper.publication_year}},
  eprint = {${paper.arxiv_id || ""}}
}`;
    navigator.clipboard.writeText(bibtex);
  }, [paper]);

  const pdfUrl = paper.pdf_url?.startsWith("blob:")
    ? paper.pdf_url
    : paper.arxiv_id
    ? `/papers/${paper.arxiv_id}.pdf`
    : paper.pdf_url || "/papers/2302.04761.pdf";

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0d10] text-[#f4f4f6] flex flex-col h-screen font-mono text-xs">
      {/* ── Toolbar ── */}
      <header className="h-10 px-3 bg-[#131317] border-b border-[#222228] flex items-center justify-between shrink-0 select-none gap-2">
        {/* Left: Back + title */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 flex items-center gap-1 text-[#a1a1aa] hover:text-[#f4f4f6] font-medium px-2 py-0.5 rounded-[2px] border border-[#2a2a36] bg-[#1a1a22] hover:bg-[#22222c] cursor-pointer text-xs transition-colors"
          >
            ← Library
          </button>
          <div className="h-3.5 w-px bg-[#262632] shrink-0" />
          <span className="text-[13.5px] font-serif font-semibold text-[#f4f4f6] truncate leading-tight tracking-tight">
            {paper.title}
          </span>
          <span className="text-[11px] text-[#71717a] shrink-0 hidden sm:inline">
            ({paper.publication_year})
          </span>
        </div>

        {/* Center: navigation + zoom + legend */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Page nav */}
          <div className="flex items-center border border-[#2a2a36] rounded-[2px] bg-[#141419] overflow-hidden text-xs">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-2 py-0.5 text-[#a1a1aa] hover:bg-[#1e1e28] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              ‹
            </button>
            <span className="px-2 font-mono text-[#f4f4f6] border-x border-[#2a2a36] text-[11px]">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-2 py-0.5 text-[#a1a1aa] hover:bg-[#1e1e28] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              ›
            </button>
          </div>

          {/* Zoom */}
          <div className="flex items-center border border-[#2a2a36] rounded-[2px] bg-[#141419] overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.6, parseFloat((s - 0.1).toFixed(1))))}
              className="px-2 py-0.5 text-[#a1a1aa] hover:bg-[#1e1e28] cursor-pointer"
              title="Zoom out"
            >
              −
            </button>
            <span className="px-2 font-mono text-[#a1a1aa] border-x border-[#2a2a36] text-[11px]">
              {zoomPct}%
            </span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(2.5, parseFloat((s + 0.1).toFixed(1))))}
              className="px-2 py-0.5 text-[#a1a1aa] hover:bg-[#1e1e28] cursor-pointer"
              title="Zoom in"
            >
              +
            </button>
          </div>

          {/* Highlight legend */}
          <div className="hidden lg:flex items-center gap-2 px-2 py-0.5 border border-[#2a2a36] rounded-[2px] bg-[#141419] text-[10px] text-[#71717a]">
            {[
              { color: "#22c55e", label: "Useful" },
              { color: "#eab308", label: "Normal" },
              { color: "#ef4444", label: "Don't Know" },
              { color: "#3b82f6", label: "Math" },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: color }} />
                <span>{label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right: status, bibtex, notes toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={readingStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-[#141419] border border-[#2a2a36] text-[#a1a1aa] text-xs rounded-[2px] px-2 py-0.5 focus:outline-none cursor-pointer"
          >
            <option value="not read">not read</option>
            <option value="read">read</option>
          </select>

          <button
            type="button"
            onClick={copyBibtex}
            className="text-xs px-2 py-0.5 rounded-[2px] border border-[#2a2a36] bg-[#141419] hover:bg-[#1e1e28] text-[#a1a1aa] cursor-pointer hidden sm:inline-block"
            title="Copy BibTeX"
          >
            BibTeX
          </button>

          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs px-2 py-0.5 rounded-[2px] border border-[#2a2a36] bg-[#141419] hover:bg-[#1e1e28] text-[#a1a1aa] cursor-pointer hidden sm:inline-flex items-center gap-1 no-underline"
              title="Open raw PDF in new browser tab"
            >
              <span>PDF</span>
              <span className="text-[10px] text-[#71717a]">↗</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => setIsNotesOpen((v) => !v)}
            className={`text-xs px-2.5 py-0.5 rounded-[2px] border font-medium cursor-pointer transition-colors ${
              isNotesOpen
                ? "bg-amber-500 text-black border-amber-500 font-semibold"
                : "bg-[#141419] border-[#2a2a36] text-[#a1a1aa] hover:bg-[#1e1e28]"
            }`}
          >
            {isNotesOpen ? "Close Notes" : `Notes${highlights.length ? ` · ${highlights.length}` : ""}`}
          </button>
        </div>
      </header>

      {/* ── Main split area ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF reading workbench area */}
        <div className="flex-1 overflow-y-auto bg-[#121216]">
          {pdfUrl ? (
            <PdfViewer
              ref={pdfViewerRef}
              pdfUrl={pdfUrl}
              scale={scale}
              highlights={highlights}
              onHighlightCreated={handleHighlightCreated}
              onPageVisible={setCurrentPage}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#52525b] text-xs font-mono">
              // No PDF available for this paper.
            </div>
          )}
        </div>

        {/* Notes / Highlights sidebar */}
        {isNotesOpen && (
          <div
            className="w-80 shrink-0 border-l border-[#222228] flex flex-col bg-[#111115] overflow-hidden"
            style={{ minWidth: 280, maxWidth: 420 }}
          >
            {/* Sidebar tabs */}
            <div className="flex border-b border-[#222228] shrink-0 bg-[#131317]">
              <button
                type="button"
                onClick={() => setSidebarTab("notes")}
                className={`flex-1 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                  sidebarTab === "notes"
                    ? "text-amber-400 border-b-2 border-amber-500 bg-[#0d0d10]"
                    : "text-[#71717a] hover:text-[#f4f4f6]"
                }`}
              >
                Notes
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab("highlights")}
                className={`flex-1 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                  sidebarTab === "highlights"
                    ? "text-amber-400 border-b-2 border-amber-500 bg-[#0d0d10]"
                    : "text-[#71717a] hover:text-[#f4f4f6]"
                }`}
              >
                Highlights
                {highlights.length > 0 && (
                  <span className="ml-1 text-[10px] text-[#71717a]">({highlights.length})</span>
                )}
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-hidden">
              {sidebarTab === "notes" ? (
                <NotesPanel
                  paper={paper}
                  notesText={notesText}
                  onNotesChange={handleNotesChange}
                  savedStatus={savedStatus}
                  highlights={highlights}
                />
              ) : (
                <HighlightsPanel
                  highlights={highlights}
                  onUpdateNote={handleUpdateHighlightNote}
                  onDelete={handleDeleteHighlight}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReadingWorkspace;
