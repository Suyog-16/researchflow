import React, { useState } from "react";
import { IconCollections, IconPlus } from "../components/common/Icons";

export function CollectionsPage({
  collections,
  papers,
  onSelectCollection,
  onAddCollection,
}) {
  const [newColName, setNewColName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    onAddCollection({
      id: `col-${Date.now()}`,
      name: newColName.trim(),
      count: 0,
    });
    setNewColName("");
    setIsCreating(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d10] text-xs font-mono text-[#f4f4f6]">
      {/* Top Bar */}
      <div className="p-3 border-b border-[#222228] flex items-center justify-between bg-[#131317]">
        <div>
          <h1 className="font-semibold text-[#f4f4f6] text-sm flex items-center gap-2">
            <IconCollections className="w-4 h-4 text-amber-500" />
            <span>Thematic Collections</span>
          </h1>
          <p className="text-[11px] text-[#71717a] mt-0.5">
            // literature categorized by research topic
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-[3px] text-xs font-semibold cursor-pointer transition-colors"
        >
          <IconPlus className="w-3.5 h-3.5 text-black" />
          <span>New Collection</span>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-3 bg-[#181820] border-b border-[#222228] flex items-center gap-2">
          <input
            type="text"
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            placeholder="Collection name (e.g. Reasoning Models)..."
            className="w-80 px-2.5 py-1.5 bg-[#0e0e12] border border-[#2e2e38] text-[#f4f4f6] rounded-[3px] text-xs focus:outline-none focus:border-amber-500 font-mono"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-[3px] text-xs font-semibold cursor-pointer"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            className="px-2.5 py-1.5 border border-[#2e2e38] hover:bg-[#202028] text-[#a1a1aa] rounded-[3px] text-xs cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Table of collections */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse table-fixed text-xs font-mono">
          <thead>
            <tr className="border-b border-[#222228] bg-[#141419] text-[11px] font-semibold text-[#71717a] uppercase tracking-wider select-none">
              <th className="w-6/12 py-2.5 px-3.5 border-r border-[#222228]">Collection Name</th>
              <th className="w-3/12 py-2.5 px-3.5 border-r border-[#222228] text-right">Papers</th>
              <th className="w-3/12 py-2.5 px-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e24]">
            {collections.map((col) => {
              const actualCount = papers.filter((p) => p.collection === col.name).length;
              return (
                <tr
                  key={col.id}
                  onClick={() => onSelectCollection(col.name)}
                  className="hover:bg-[#16161d] transition-colors cursor-pointer"
                >
                  <td className="py-2.5 px-3.5 border-r border-[#222228] font-medium text-[#f4f4f6] flex items-center gap-2">
                    <span className="text-amber-500 text-xs">~</span>
                    <span>{col.name}</span>
                  </td>
                  <td className="py-2.5 px-3.5 border-r border-[#222228] font-mono text-[#71717a] text-right text-xs">
                    {actualCount} papers
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCollection(col.name);
                      }}
                      className="text-xs text-amber-500/90 hover:text-amber-300 hover:underline cursor-pointer"
                    >
                      browse &rarr;
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CollectionsPage;
