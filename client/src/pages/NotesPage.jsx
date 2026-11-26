import React, { useState } from "react";
import { IconNotes, IconHighlighter } from "../components/common/Icons";
import { HIGHLIGHT_CATEGORIES } from "../data/mockData";
import MarkdownLiveEditor from "../components/workspace/MarkdownLiveEditor";

export function NotesPage({ papers, onUpdatePaper, onOpenReader }) {
  const [selectedPaperId, setSelectedPaperId] = useState(papers[0]?.id || null);
  const [search, setSearch] = useState("");

  const papersWithNotes = papers.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.notes?.toLowerCase().includes(q) ||
      p.highlights?.some((h) => h.text.toLowerCase().includes(q) || h.note?.toLowerCase().includes(q)) ||
      p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const activePaper = papers.find((p) => p.id === selectedPaperId) || papersWithNotes[0];

  const handleNotesEdit = (text) => {
    if (activePaper) {
      onUpdatePaper(activePaper.id, { notes: text });
    }
  };

  return (
    <div className="flex h-full bg-[#0d0d10] text-xs divide-x divide-[#222228] font-sans text-[#f4f4f6]">
      {/* Left List of Papers */}
      <div className="w-80 flex flex-col bg-[#111115] shrink-0">
        <div className="p-2.5 border-b border-[#222228]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="grep notes & refs..."
            className="w-full px-2.5 py-1.5 bg-[#0e0e12] border border-[#282834] rounded-[3px] text-xs text-[#f4f4f6] placeholder-[#52525b] focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#1e1e24]">
          {papersWithNotes.map((p) => {
            const isSelected = activePaper?.id === p.id;
            const hlCount = p.highlights?.length || 0;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPaperId(p.id)}
                className={`p-3 cursor-pointer transition-colors ${
                  isSelected ? "bg-[#191922] border-l-2 border-amber-500" : "hover:bg-[#15151c]"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-medium text-[#f4f4f6] text-xs truncate">{p.title}</span>
                  {hlCount > 0 && (
                    <span className="text-[10px] px-1 py-0.2 rounded bg-amber-400/10 text-amber-300 border border-amber-500/20 shrink-0 flex items-center gap-1">
                      <IconHighlighter className="w-2.5 h-2.5 text-amber-400" />
                      {hlCount}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#71717a] mt-0.5">
                  {p.venue || "arXiv"} • {p.publication_year}
                </div>
                {p.notes ? (
                  <p className="text-[11px] text-[#a1a1aa] line-clamp-2 mt-1.5 leading-relaxed">
                    {p.notes.replace(/[#*`-]/g, "").slice(0, 90)}...
                  </p>
                ) : (
                  <p className="text-[11px] text-[#52525b] italic mt-1.5">// no notes recorded</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Side: Active Paper Notes & Referenced Highlights */}
      <div className="flex-1 flex flex-col bg-[#0d0d10]">
        {activePaper ? (
          <>
            <div className="p-3 border-b border-[#222228] flex items-center justify-between bg-[#131317]">
              <div className="min-w-0 pr-4">
                <h2 className="font-serif font-bold text-[#f4f4f6] text-base truncate tracking-tight">
                  {activePaper.title}
                </h2>
                <div className="text-[11px] text-[#71717a] mt-0.5">
                  {(activePaper.authors || []).join(", ")} • {activePaper.collection}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenReader(activePaper)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-[3px] text-xs shrink-0 cursor-pointer transition-colors"
              >
                Open Reader &rarr;
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#222228]">
              {/* Markdown Notes Editor — Obsidian Live Preview */}
              <div className="flex-1 flex flex-col p-4 bg-[#0d0d10] overflow-hidden">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <span className="text-[10px] font-semibold tracking-wider text-[#71717a] uppercase flex items-center gap-1.5">
                    <IconNotes className="w-3.5 h-3.5 text-amber-500" />
                    <span>// synthesis & notes</span>
                  </span>
                  <span className="text-[10px] text-[#52525b]">auto-saved</span>
                </div>

                <div className="flex-1 overflow-hidden border border-[#222228] rounded-[3px] flex flex-col">
                  <MarkdownLiveEditor
                    value={activePaper.notes || ""}
                    onChange={handleNotesEdit}
                    placeholder="Record insights, citations, and critical evaluations..."
                  />
                </div>
              </div>

              {/* Highlights & References */}
              <div className="w-full md:w-88 p-4 bg-[#111115] overflow-y-auto shrink-0 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-wider text-[#71717a] uppercase flex items-center gap-1.5">
                    <IconHighlighter className="w-3.5 h-3.5 text-amber-500" />
                    <span>// highlights ({activePaper.highlights?.length || 0})</span>
                  </span>
                </div>

                {activePaper.highlights && activePaper.highlights.length > 0 ? (
                  <div className="space-y-2">
                    {activePaper.highlights.map((hl) => {
                      const cat = HIGHLIGHT_CATEGORIES[hl.color] || HIGHLIGHT_CATEGORIES.yellow;
                      const dotColors = {
                        green: "#22c55e",
                        yellow: "#eab308",
                        red: "#ef4444",
                        blue: "#3b82f6",
                      };
                      return (
                        <div
                          key={hl.id}
                          className="p-2.5 rounded-[3px] bg-[#171720] border border-[#262632] space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="flex items-center gap-1.5 font-semibold text-[#f4f4f6]">
                              <span
                                className="w-1.5 h-1.5 rounded-full inline-block"
                                style={{ background: dotColors[hl.color] }}
                              />
                              {cat.name}
                            </span>
                            {hl.pageNum && (
                              <span className="text-[#52525b]">p. {hl.pageNum}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#a1a1aa] italic leading-normal">
                            &ldquo;{hl.text}&rdquo;
                          </p>
                          {hl.note && (
                            <p className="text-[11px] text-[#f4f4f6] bg-[#1e1e2a] p-1.5 rounded-[2px] border border-[#2c2c3c]">
                              {hl.note}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-[#52525b] text-xs">
                    // no highlights recorded for this paper
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#52525b] text-xs">
            // select a paper to view notes
          </div>
        )}
      </div>
    </div>
  );
}

export default NotesPage;
