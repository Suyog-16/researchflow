import React, { useState, useMemo, useEffect } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { DashboardPage } from "./pages/DashboardPage";
import { LibraryPage } from "./pages/LibraryPage";
import { ReadingListPage } from "./pages/ReadingListPage";
import { CollectionsPage } from "./pages/CollectionsPage";
import { NotesPage } from "./pages/NotesPage";
import { ReadingWorkspace } from "./components/workspace/ReadingWorkspace";
import { AddPaperModal } from "./components/forms/AddPaperModal";
import { initialPapers, initialCollections } from "./data/mockData";
import * as api from "./services/api";

export default function App() {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [papers, setPapers] = useState(initialPapers);
  const [collections, setCollections] = useState(initialCollections);
  const [libraryCollectionFilter, setLibraryCollectionFilter] = useState("all");

  // Active reading workspace paper (null when reader is closed)
  const [activeReadingPaper, setActiveReadingPaper] = useState(null);

  // Add Paper Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch papers and collections from PostgreSQL backend on mount
  useEffect(() => {
    let isMounted = true;

    async function loadBackendData() {
      try {
        const [papersRes, colsRes] = await Promise.allSettled([
          api.getPapers(),
          api.getCollections(),
        ]);

        if (!isMounted) return;

        if (papersRes.status === "fulfilled" && Array.isArray(papersRes.value) && papersRes.value.length > 0) {
          setPapers(papersRes.value);
        }

        if (colsRes.status === "fulfilled" && Array.isArray(colsRes.value) && colsRes.value.length > 0) {
          setCollections(colsRes.value);
        }
      } catch (err) {
        console.warn("Could not load backend data, falling back to local seed data:", err);
      }
    }

    loadBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Derived counts for sidebar
  const counts = useMemo(() => {
    const unread = papers.filter((p) => p.reading_status === "not read").length;
    const notesCount = papers.filter((p) => p.notes && p.notes.trim().length > 0).length;
    return {
      totalPapers: papers.length,
      unreadCount: unread,
      collectionsCount: collections.length,
      notesCount: notesCount,
    };
  }, [papers, collections]);

  // Update paper attributes (e.g. notes, status, currentPage, highlights)
  const handleUpdatePaper = (paperId, updates) => {
    // 1. Optimistic UI update
    setPapers((prev) =>
      prev.map((p) => {
        if (p.id === paperId) {
          const updated = { ...p, ...updates };
          if (activeReadingPaper && activeReadingPaper.id === paperId) {
            setActiveReadingPaper(updated);
          }
          return updated;
        }
        return p;
      })
    );

    // 2. Persist to PostgreSQL backend asynchronously
    api.updatePaper(paperId, updates).catch((err) => {
      console.warn(`Failed to persist update for paper ${paperId} to backend:`, err);
    });
  };

  // Add Paper
  const handleAddPaper = async (newPaper) => {
    // 1. Optimistic UI update
    setPapers((prev) => [newPaper, ...prev]);

    // Update collection count
    setCollections((prev) =>
      prev.map((c) => (c.name === newPaper.collection ? { ...c, count: c.count + 1 } : c))
    );

    // 2. Persist to PostgreSQL backend
    try {
      const savedPaper = await api.createPaper(newPaper);
      if (savedPaper && savedPaper.id) {
        setPapers((prev) =>
          prev.map((p) => (p.id === newPaper.id ? savedPaper : p))
        );
      }
      // Re-sync collections to get updated counts
      const updatedCols = await api.getCollections();
      if (Array.isArray(updatedCols) && updatedCols.length > 0) {
        setCollections(updatedCols);
      }
    } catch (err) {
      console.warn("Failed to create paper on backend:", err);
    }
  };

  // Add Collection
  const handleAddCollection = async (newCol) => {
    // 1. Optimistic UI update
    setCollections((prev) => [...prev, newCol]);

    // 2. Persist to PostgreSQL backend
    try {
      const savedCol = await api.createCollection(newCol.name);
      if (savedCol && savedCol.id) {
        setCollections((prev) =>
          prev.map((c) => (c.id === newCol.id ? savedCol : c))
        );
      }
    } catch (err) {
      console.warn("Failed to create collection on backend:", err);
    }
  };

  // Filter Library by Collection from sidebar or collections page
  const handleSelectCollection = (colName) => {
    setLibraryCollectionFilter(colName);
    setCurrentTab("library");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0d0d10] text-[#f4f4f6] font-sans antialiased">
      {/* Fixed, narrow left sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === "library") setLibraryCollectionFilter("all");
          setCurrentTab(tab);
        }}
        counts={counts}
        collections={collections}
        onSelectCollection={handleSelectCollection}
      />

      {/* Main Content Area - Maximizes usable desktop screen space */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0d0d10]">
        {currentTab === "dashboard" && (
          <div className="flex-1 overflow-y-auto">
            <DashboardPage
              papers={papers}
              onOpenReader={(paper) => setActiveReadingPaper(paper)}
              onNavigate={setCurrentTab}
              onOpenAddPaper={() => setIsAddModalOpen(true)}
            />
          </div>
        )}

        {currentTab === "library" && (
          <LibraryPage
            papers={papers}
            collections={collections}
            initialCollectionFilter={libraryCollectionFilter}
            onOpenReader={(paper) => setActiveReadingPaper(paper)}
            onOpenAddPaper={() => setIsAddModalOpen(true)}
            onUpdatePaper={handleUpdatePaper}
          />
        )}

        {currentTab === "reading-list" && (
          <ReadingListPage
            papers={papers}
            onOpenReader={(paper) => setActiveReadingPaper(paper)}
            onUpdatePaper={handleUpdatePaper}
          />
        )}

        {currentTab === "collections" && (
          <CollectionsPage
            collections={collections}
            papers={papers}
            onSelectCollection={handleSelectCollection}
            onAddCollection={handleAddCollection}
          />
        )}

        {currentTab === "notes" && (
          <NotesPage
            papers={papers}
            onUpdatePaper={handleUpdatePaper}
            onOpenReader={(paper) => setActiveReadingPaper(paper)}
          />
        )}
      </main>

      {/* Reading Workspace (Split-screen PDF reader + Notes Editor) */}
      {activeReadingPaper && (
        <ReadingWorkspace
          paper={activeReadingPaper}
          onClose={() => setActiveReadingPaper(null)}
          onUpdatePaper={handleUpdatePaper}
        />
      )}

      {/* Add Paper Dialog */}
      <AddPaperModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPaper={handleAddPaper}
        collections={collections}
      />
    </div>
  );
}
