import React from "react";
import { IconPlus } from "../components/common/Icons";

export function DashboardPage({
  papers,
  onOpenReader,
  onNavigate,
  onOpenAddPaper,
}) {
  const notReadPapers = papers.filter((p) => p.reading_status === "not read");
  const readPapers = papers.filter((p) => p.reading_status === "read");

  const recentPapers = [...papers]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 font-sans text-[13px] text-[#f4f4f6]">
      {/* Minimal Top Header / Command bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#222228]">
        <div>
          <div className="text-xs text-[#71717a] font-mono flex items-center gap-2">
            <span className="text-amber-500">~/researchflow</span>
            <span>$</span>
            <span className="text-[#a1a1aa]">status</span>
          </div>
          <h1 className="text-xl font-serif font-bold text-[#f4f4f6] mt-1 tracking-tight">
            Research Literature Queue
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddPaper}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-[3px] text-xs font-semibold cursor-pointer transition-colors"
          >
            <IconPlus className="w-3.5 h-3.5 text-black" />
            <span>Add Paper</span>
          </button>
        </div>
      </div>

      {/* Streamlined Stats Bar: total, not read, read */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#141419] border border-[#222228] p-3 rounded-[3px]">
          <div className="text-[10px] text-[#71717a] uppercase tracking-wider">// total papers</div>
          <div className="text-lg font-bold text-[#f4f4f6] mt-0.5">{papers.length}</div>
        </div>
        <div className="bg-[#141419] border border-[#222228] p-3 rounded-[3px]">
          <div className="text-[10px] text-amber-500 uppercase tracking-wider">// not read</div>
          <div className="text-lg font-bold text-amber-400 mt-0.5">{notReadPapers.length}</div>
        </div>
        <div className="bg-[#141419] border border-[#222228] p-3 rounded-[3px]">
          <div className="text-[10px] text-emerald-400 uppercase tracking-wider">// read</div>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">{readPapers.length}</div>
        </div>
      </div>

      {/* Reading Queue (Unread Papers) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#a1a1aa] font-semibold flex items-center gap-2">
            <span className="text-amber-500">&gt;</span>
            <span>READING QUEUE</span>
            <span className="text-[10px] text-[#71717a] font-normal">
              ({notReadPapers.length} not read)
            </span>
          </span>
          <button
            type="button"
            onClick={() => onNavigate("reading-list")}
            className="text-[11px] text-amber-500/80 hover:text-amber-400 hover:underline cursor-pointer"
          >
            view reading list &rarr;
          </button>
        </div>

        {notReadPapers.length > 0 ? (
          <div className="space-y-2">
            {notReadPapers.map((paper) => (
              <div
                key={paper.id}
                className="bg-[#141419] border border-[#26262e] hover:border-[#383844] rounded-[3px] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      onClick={() => onOpenReader(paper)}
                      className="font-serif font-semibold text-[#f4f4f6] text-[15px] hover:text-amber-400 cursor-pointer transition-colors tracking-tight"
                    >
                      {paper.title}
                    </span>
                    <span className="text-[11px] text-[#71717a] font-mono">
                      ({paper.publication_year})
                    </span>
                    {paper.highlights && paper.highlights.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-300 border border-amber-500/20">
                        {paper.highlights.length} highlights
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#a1a1aa] flex items-center gap-2 truncate">
                    <span className="truncate">{(paper.authors || []).join(", ")}</span>
                    <span className="text-[#52525b]">•</span>
                    <span className="text-amber-400/80 shrink-0">{paper.collection}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#1c1c24] text-[#a1a1aa] border border-[#2a2a36]">
                    not read
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenReader(paper)}
                    className="px-3 py-1.5 bg-[#202028] hover:bg-[#282834] text-[#f4f4f6] hover:text-amber-400 border border-[#30303c] rounded-[3px] text-xs font-semibold cursor-pointer shrink-0 transition-colors"
                  >
                    Read &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#141419] border border-[#222228] p-6 text-center text-[#71717a] text-xs rounded-[3px]">
            &gt; All caught up! No unread papers in queue.
          </div>
        )}
      </section>

      {/* Recent Imports Section */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#a1a1aa] font-semibold flex items-center gap-2">
            <span className="text-amber-500">&gt;</span>
            <span>RECENT LITERATURE</span>
          </span>
          <button
            type="button"
            onClick={() => onNavigate("library")}
            className="text-[11px] text-amber-500/80 hover:text-amber-400 hover:underline cursor-pointer"
          >
            browse library &rarr;
          </button>
        </div>

        <div className="bg-[#141419] border border-[#222228] rounded-[3px] overflow-hidden divide-y divide-[#1e1e26]">
          {recentPapers.map((paper) => (
            <div
              key={paper.id}
              className="px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-[#181820] transition-colors text-xs"
            >
              <div className="min-w-0 flex-1 flex items-center gap-2.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    paper.reading_status === "read" ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                <span
                  onClick={() => onOpenReader(paper)}
                  className="font-serif font-medium text-[#f4f4f6] hover:text-amber-400 cursor-pointer truncate tracking-tight text-[13.5px]"
                >
                  {paper.title}
                </span>
                <span className="text-[11px] text-[#71717a] hidden md:inline shrink-0">
                  {paper.collection}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-[#71717a] text-[11px]">
                <span className="hidden sm:inline font-mono">{paper.date_added || "2024-11-01"}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#181820] text-[#a1a1aa] border border-[#242430]">
                  {paper.reading_status}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenReader(paper)}
                  className="px-2 py-0.5 rounded text-amber-500/90 hover:text-amber-300 hover:bg-amber-500/10 cursor-pointer transition-colors"
                >
                  read &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
