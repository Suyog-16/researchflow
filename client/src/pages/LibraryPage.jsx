import React, { useState, useMemo } from "react";
import { IconSearch, IconPlus, IconHighlighter } from "../components/common/Icons";

export function LibraryPage({
  papers,
  collections,
  onOpenReader,
  onOpenAddPaper,
  onUpdatePaper,
  initialCollectionFilter = "all",
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [collectionFilter, setCollectionFilter] = useState(initialCollectionFilter);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState("date_added");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedPaperId, setSelectedPaperId] = useState(null);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredPapers = useMemo(() => {
    return papers
      .filter((paper) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = paper.title?.toLowerCase().includes(q);
          const matchAuthors = paper.authors?.some((a) => a.toLowerCase().includes(q));
          const matchTags = paper.tags?.some((t) => t.toLowerCase().includes(q));
          const matchArxiv = paper.arxiv_id?.toLowerCase().includes(q);
          if (!matchTitle && !matchAuthors && !matchTags && !matchArxiv) return false;
        }

        if (collectionFilter !== "all" && paper.collection !== collectionFilter) {
          return false;
        }

        if (statusFilter !== "all" && paper.reading_status !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortColumn] ?? "";
        let valB = b[sortColumn] ?? "";

        if (sortColumn === "authors") {
          valA = (a.authors || []).join(", ");
          valB = (b.authors || []).join(", ");
        }

        if (typeof valA === "string") {
          const cmp = valA.localeCompare(String(valB));
          return sortDirection === "asc" ? cmp : -cmp;
        }

        const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
        return sortDirection === "asc" ? cmp : -cmp;
      });
  }, [papers, searchQuery, collectionFilter, statusFilter, sortColumn, sortDirection]);

  const renderStatus = (paper) => {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            paper.reading_status === "read"
              ? "bg-emerald-400"
              : "bg-amber-400"
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
          className="bg-transparent border border-transparent hover:border-[#383844] rounded-[2px] text-[#f4f4f6] text-xs py-0.5 px-1 focus:outline-none focus:bg-[#1a1a22] focus:border-amber-500 cursor-pointer font-mono"
        >
          <option value="not read" className="bg-[#18181f] text-[#f4f4f6]">not read</option>
          <option value="read" className="bg-[#18181f] text-[#f4f4f6]">read</option>
        </select>
      </div>
    );
  };

  const getSortIndicator = (column) => {
    if (sortColumn !== column) return <span className="text-[#3f3f4a] ml-1">↕</span>;
    return <span className="text-amber-400 ml-1 font-bold">{sortDirection === "asc" ? "▲" : "▼"}</span>;
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d10] text-xs font-sans text-[#f4f4f6]">
      {/* Top Filter and Search Action Toolbar */}
      <div className="p-3 border-b border-[#222228] flex flex-wrap items-center justify-between gap-3 bg-[#131317]">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <span className="absolute left-2.5 top-2 pointer-events-none">
              <IconSearch className="w-3.5 h-3.5 text-[#71717a]" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="grep literature..."
              className="w-64 pl-8 pr-6 py-1.5 bg-[#0e0e12] border border-[#26262e] rounded-[3px] text-xs text-[#f4f4f6] placeholder-[#52525b] focus:outline-none focus:border-amber-500 font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1.5 text-[#71717a] hover:text-[#f4f4f6] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Collection Filter */}
          <select
            value={collectionFilter}
            onChange={(e) => setCollectionFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#0e0e12] border border-[#26262e] rounded-[3px] text-[#a1a1aa] text-xs focus:outline-none focus:border-amber-500 cursor-pointer font-mono"
          >
            <option value="all" className="bg-[#18181f]">all collections</option>
            {collections.map((col) => (
              <option key={col.id} value={col.name} className="bg-[#18181f]">
                ~ {col.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#0e0e12] border border-[#26262e] rounded-[3px] text-[#a1a1aa] text-xs focus:outline-none focus:border-amber-500 cursor-pointer font-mono"
          >
            <option value="all" className="bg-[#18181f]">all statuses</option>
            <option value="not read" className="bg-[#18181f]">not read</option>
            <option value="read" className="bg-[#18181f]">read</option>
          </select>

          {(searchQuery || collectionFilter !== "all" || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCollectionFilter("all");
                setStatusFilter("all");
              }}
              className="text-[11px] text-[#71717a] hover:text-amber-400 underline cursor-pointer px-1"
            >
              clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#71717a] text-[11px] font-mono">
            {filteredPapers.length} {filteredPapers.length === 1 ? "paper" : "papers"}
          </span>

          <button
            type="button"
            onClick={onOpenAddPaper}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-[3px] text-xs cursor-pointer transition-colors"
          >
            <IconPlus className="w-3.5 h-3.5 text-black" />
            <span>Add Paper</span>
          </button>
        </div>
      </div>

      {/* Main Sortable Table View */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left border-collapse table-fixed font-mono text-xs">
          <thead>
            <tr className="border-b border-[#222228] bg-[#141419] text-[11px] font-semibold text-[#71717a] uppercase tracking-wider select-none sticky top-0 z-10">
              <th
                onClick={() => handleSort("title")}
                className="w-5/12 py-2.5 px-3.5 cursor-pointer hover:bg-[#1a1a22] border-r border-[#222228]"
              >
                Paper Title {getSortIndicator("title")}
              </th>
              <th
                onClick={() => handleSort("authors")}
                className="w-3/12 py-2.5 px-3.5 cursor-pointer hover:bg-[#1a1a22] border-r border-[#222228]"
              >
                Authors {getSortIndicator("authors")}
              </th>
              <th
                onClick={() => handleSort("publication_year")}
                className="w-20 py-2.5 px-3.5 cursor-pointer hover:bg-[#1a1a22] border-r border-[#222228] text-right"
              >
                Year {getSortIndicator("publication_year")}
              </th>
              <th
                onClick={() => handleSort("collection")}
                className="w-44 py-2.5 px-3.5 cursor-pointer hover:bg-[#1a1a22] border-r border-[#222228]"
              >
                Collection {getSortIndicator("collection")}
              </th>
              <th
                onClick={() => handleSort("reading_status")}
                className="w-36 py-2.5 px-3.5 cursor-pointer hover:bg-[#1a1a22] border-r border-[#222228]"
              >
                Status {getSortIndicator("reading_status")}
              </th>
              <th
                onClick={() => handleSort("date_added")}
                className="w-28 py-2.5 px-3.5 cursor-pointer hover:bg-[#1a1a22] text-right"
              >
                Added {getSortIndicator("date_added")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e24] text-xs">
            {filteredPapers.length > 0 ? (
              filteredPapers.map((paper) => {
                const isSelected = selectedPaperId === paper.id;
                const highlightCount = paper.highlights?.length || 0;
                return (
                  <tr
                    key={paper.id}
                    onClick={() => setSelectedPaperId(paper.id)}
                    onDoubleClick={() => onOpenReader(paper)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected ? "bg-[#1c1c24]" : "hover:bg-[#16161d]"
                    }`}
                  >
                    {/* Title */}
                    <td className="py-2.5 px-3.5 border-r border-[#222228] truncate">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenReader(paper);
                            }}
                            className="font-serif font-semibold text-[#f4f4f6] text-[13.5px] hover:text-amber-400 hover:underline truncate cursor-pointer tracking-tight"
                            title="Click to open in Reading Workspace"
                          >
                            {paper.title}
                          </span>
                          {highlightCount > 0 && (
                            <span
                              className="inline-flex items-center gap-1 font-mono text-[10px] px-1 py-0.2 rounded bg-amber-400/10 text-amber-300 border border-amber-500/20 shrink-0"
                              title={`${highlightCount} highlighted references`}
                            >
                              <IconHighlighter className="w-2.5 h-2.5 text-amber-400" />
                              {highlightCount}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenReader(paper);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[11px] font-semibold px-2 py-0.5 rounded bg-[#252530] text-amber-400 hover:bg-amber-500 hover:text-black shrink-0 cursor-pointer border border-[#383848] transition-colors"
                        >
                          read &rarr;
                        </button>
                      </div>
                    </td>

                    {/* Authors */}
                    <td className="py-2.5 px-3.5 border-r border-[#222228] text-[#a1a1aa] truncate text-xs">
                      {(paper.authors || []).join(", ")}
                    </td>

                    {/* Year */}
                    <td className="py-2.5 px-3.5 border-r border-[#222228] text-[#71717a] font-mono text-right text-xs">
                      {paper.publication_year}
                    </td>

                    {/* Collection */}
                    <td className="py-2.5 px-3.5 border-r border-[#222228] text-[#a1a1aa] truncate text-xs">
                      {paper.collection || "—"}
                    </td>

                    {/* Reading Status */}
                    <td className="py-2.5 px-3.5 border-r border-[#222228]">
                      {renderStatus(paper)}
                    </td>

                    {/* Date Added */}
                    <td className="py-2.5 px-3.5 text-[#52525b] font-mono text-xs text-right">
                      {paper.date_added || "2024-11-01"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#52525b] text-xs font-mono">
                  &gt; No papers matching query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Information-dense bottom status bar */}
      <div className="h-8 px-3.5 border-t border-[#222228] bg-[#131317] flex items-center justify-between text-[11px] text-[#71717a] font-mono">
        <span>total: {papers.length} entries</span>
        <span className="hidden sm:inline">double-click or [read] to open reader</span>
      </div>
    </div>
  );
}

export default LibraryPage;
