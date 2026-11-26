import React, { useState } from "react";
import { IconHighlighter } from "../components/common/Icons";

export function ReadingListPage({ papers, onOpenReader, onUpdatePaper }) {
  const [activeFilter, setActiveFilter] = useState("all");

  const notReadPapers = papers.filter((p) => p.reading_status === "not read");
  const readPapers = papers.filter((p) => p.reading_status === "read");

  const displayedPapers =
    activeFilter === "not read"
      ? notReadPapers
      : activeFilter === "read"
      ? readPapers
      : papers;

  return (
    <div className="flex flex-col h-full bg-[#0d0d10] text-xs font-sans text-[#f4f4f6]">
      {/* Top Filter Bar */}
      <div className="p-3 border-b border-[#222228] flex items-center justify-between bg-[#131317]">
        <div className="flex items-center gap-1 bg-[#0e0e12] border border-[#26262e] rounded-[3px] p-0.5">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-2.5 py-1 rounded-[2px] text-xs font-medium cursor-pointer transition-colors ${
              activeFilter === "all"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold"
                : "text-[#a1a1aa] hover:text-[#f4f4f6]"
            }`}
          >
            all ({papers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("not read")}
            className={`px-2.5 py-1 rounded-[2px] text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-colors ${
              activeFilter === "not read"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold"
                : "text-[#a1a1aa] hover:text-[#f4f4f6]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            not read ({notReadPapers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("read")}
            className={`px-2.5 py-1 rounded-[2px] text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-colors ${
              activeFilter === "read"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold"
                : "text-[#a1a1aa] hover:text-[#f4f4f6]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            read ({readPapers.length})
          </button>
        </div>

        <span className="text-[11px] text-[#52525b]">
          double-click to open reader
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse table-fixed text-xs font-mono">
          <thead>
            <tr className="border-b border-[#222228] bg-[#141419] text-[11px] font-semibold text-[#71717a] uppercase tracking-wider select-none sticky top-0">
              <th className="w-6/12 py-2.5 px-3.5 border-r border-[#222228]">Paper Title</th>
              <th className="w-3/12 py-2.5 px-3.5 border-r border-[#222228]">Authors</th>
              <th className="w-40 py-2.5 px-3.5 border-r border-[#222228]">Collection</th>
              <th className="w-36 py-2.5 px-3.5 border-r border-[#222228]">Status</th>
              <th className="w-20 py-2.5 px-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e24]">
            {displayedPapers.map((paper) => (
              <tr
                key={paper.id}
                onDoubleClick={() => onOpenReader(paper)}
                className="hover:bg-[#16161d] transition-colors cursor-pointer"
              >
                <td className="py-2.5 px-3.5 border-r border-[#222228] truncate text-[#f4f4f6]">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      onClick={() => onOpenReader(paper)}
                      className="font-serif font-semibold text-[#f4f4f6] text-[13.5px] hover:text-amber-400 hover:underline truncate tracking-tight"
                    >
                      {paper.title}
                    </span>
                    {paper.highlights && paper.highlights.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-1 py-0.2 rounded bg-amber-400/10 text-amber-300 border border-amber-500/20 shrink-0">
                        <IconHighlighter className="w-2.5 h-2.5 text-amber-400" />
                        {paper.highlights.length}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2.5 px-3.5 border-r border-[#222228] text-[#a1a1aa] truncate text-xs">
                  {(paper.authors || []).join(", ")}
                </td>
                <td className="py-2.5 px-3.5 border-r border-[#222228] text-[#a1a1aa] truncate text-xs">
                  {paper.collection || "—"}
                </td>
                <td className="py-2.5 px-3.5 border-r border-[#222228]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        paper.reading_status === "read" ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                    <select
                      value={paper.reading_status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        onUpdatePaper(paper.id, {
                          reading_status: e.target.value,
                        })
                      }
                      className="bg-[#0e0e12] border border-[#26262e] text-[#f4f4f6] text-xs rounded-[2px] px-1.5 py-0.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="not read" className="bg-[#18181f]">not read</option>
                      <option value="read" className="bg-[#18181f]">read</option>
                    </select>
                  </div>
                </td>
                <td className="py-2.5 px-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onOpenReader(paper)}
                    className="text-xs text-amber-500/90 hover:text-amber-300 hover:underline cursor-pointer font-medium"
                  >
                    read &rarr;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReadingListPage;
