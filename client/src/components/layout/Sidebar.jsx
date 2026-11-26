import React from "react";
import {
  IconDashboard,
  IconLibrary,
  IconReadingList,
  IconCollections,
  IconNotes,
} from "../common/Icons";

export function Sidebar({ currentTab, onSelectTab, counts = {}, collections = [], onSelectCollection }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", count: null, icon: IconDashboard },
    { id: "library", label: "My Library", count: counts.totalPapers || null, icon: IconLibrary },
    { id: "reading-list", label: "Reading List", count: counts.unreadCount || null, icon: IconReadingList },
    { id: "collections", label: "Collections", count: counts.collectionsCount || null, icon: IconCollections },
    { id: "notes", label: "Notes", count: counts.notesCount || null, icon: IconNotes },
  ];

  return (
    <aside className="w-56 shrink-0 bg-[#111115] border-r border-[#222228] flex flex-col justify-between select-none h-screen sticky top-0 text-[13px] font-sans">
      <div>
        {/* Header / Brand */}
        <div className="h-11 px-3.5 border-b border-[#222228] flex items-center justify-between bg-[#141419]">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-[3px] bg-amber-500 text-black flex items-center justify-center text-[10px] font-bold font-mono">
              &gt;_
            </span>
            <span className="font-serif font-bold text-[#f4f4f6] text-sm tracking-tight">
              researchflow
            </span>
          </div>
          <span className="text-[10px] text-[#71717a] font-mono bg-[#1c1c22] px-1.5 py-0.5 rounded border border-[#2a2a34]">
            v0.3
          </span>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-0.5">
          <div className="px-2 pt-2.5 pb-1 text-[10px] font-semibold tracking-wider text-[#52525b] uppercase">
            // navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[3px] text-left transition-colors cursor-pointer text-xs ${
                  isActive
                    ? "bg-[#1c1c24] text-amber-400 font-semibold border-l-2 border-amber-500"
                    : "text-[#a1a1aa] hover:bg-[#18181f] hover:text-[#f4f4f6]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-[#71717a]"}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== null && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isActive
                        ? "bg-amber-400/10 text-amber-300 border border-amber-500/20"
                        : "text-[#71717a]"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Collections List */}
          <div className="pt-4 px-2 pb-1 text-[10px] font-semibold tracking-wider text-[#52525b] uppercase flex items-center justify-between">
            <span>// collections</span>
            <button
              type="button"
              onClick={() => onSelectTab("collections")}
              className="text-[10px] text-amber-500/80 hover:text-amber-400 hover:underline lowercase cursor-pointer"
            >
              all
            </button>
          </div>
          <div className="space-y-0.5">
            {collections.slice(0, 5).map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => {
                  onSelectTab("library");
                  if (onSelectCollection) onSelectCollection(col.name);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[3px] text-left text-[#a1a1aa] hover:bg-[#18181f] hover:text-[#f4f4f6] text-xs truncate cursor-pointer group"
                title={col.name}
              >
                <span className="truncate pr-2 flex items-center gap-1.5">
                  <span className="text-amber-500/70 text-[11px]">~</span>
                  <span className="truncate">{col.name}</span>
                </span>
                <span className="text-[10px] font-mono text-[#52525b] group-hover:text-[#a1a1aa]">
                  {col.count}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Terminal status bar */}
      <div className="p-3 border-t border-[#222228] text-xs bg-[#141419]">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#a1a1aa] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.6)]" />
            <span>active</span>
          </span>
          <span className="text-[#71717a] font-mono">{counts.totalPapers || 0} papers</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
