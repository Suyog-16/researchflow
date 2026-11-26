import React, { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { IconLink, IconUpload } from "../common/Icons";

// Helper: Extract clean arXiv ID from various URL or string formats
function parseArxivId(input) {
  if (!input) return "";
  const trimmed = input.trim();
  // Matches e.g. 2302.04761 or 2302.04761v2 or cs/0101001
  const idMatch = trimmed.match(/(\d{4}\.\d{4,5}(?:v\d+)?)|([a-z-]+(?:\.[A-Z]{2})?\/\d{7})/i);
  return idMatch ? idMatch[0].replace(/v\d+$/, "") : trimmed;
}

// Helper: Format bytes to human readable size
function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function AddPaperModal({ isOpen, onClose, onAddPaper, collections = [] }) {
  const [activeTab, setActiveTab] = useState("arxiv"); // "arxiv" | "local"

  // arXiv tab state
  const [arxivQuery, setArxivQuery] = useState("");
  const [isFetchingArxiv, setIsFetchingArxiv] = useState(false);
  const [arxivFetched, setArxivFetched] = useState(null);

  // Local PDF tab state
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPdfBlobUrl, setLocalPdfBlobUrl] = useState(null);
  const [localPdfPageCount, setLocalPdfPageCount] = useState(1);
  const [isReadingPdf, setIsReadingPdf] = useState(false);
  const fileInputRef = useRef(null);

  // Shared form fields
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState(2024);
  const [collection, setCollection] = useState(collections[0]?.name || "General");
  const [readingStatus, setReadingStatus] = useState("not read");
  const [abstract, setAbstract] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  // Reset form when closing or switching
  const resetForm = () => {
    setTitle("");
    setAuthors("");
    setYear(2024);
    setCollection(collections[0]?.name || "General");
    setReadingStatus("not read");
    setAbstract("");
    setArxivQuery("");
    setArxivFetched(null);
    setSelectedFile(null);
    if (localPdfBlobUrl) {
      URL.revokeObjectURL(localPdfBlobUrl);
      setLocalPdfBlobUrl(null);
    }
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ── Fetch metadata from arXiv ─────────────────────────────────────────────
  const handleFetchArxiv = async (e) => {
    e?.preventDefault();
    setError("");
    const cleanId = parseArxivId(arxivQuery);
    if (!cleanId) {
      setError("Please enter a valid arXiv ID or paper URL.");
      return;
    }

    setIsFetchingArxiv(true);
    try {
      const res = await fetch(`/api/arxiv?id_list=${cleanId}`);
      if (!res.ok) {
        throw new Error(`arXiv API responded with status ${res.status}`);
      }

      const xmlText = await res.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const entry = xmlDoc.querySelector("entry");

      if (!entry) {
        throw new Error("No paper found for this arXiv ID.");
      }

      const rawTitle = entry.querySelector("title")?.textContent || "";
      const cleanTitle = rawTitle.replace(/\s+/g, " ").trim();

      const authorEls = entry.querySelectorAll("author name");
      const authorList = Array.from(authorEls).map((a) => a.textContent?.trim()).filter(Boolean);

      const published = entry.querySelector("published")?.textContent || "";
      const pubYear = published ? new Date(published).getFullYear() : 2024;

      const rawSummary = entry.querySelector("summary")?.textContent || "";
      const cleanSummary = rawSummary.replace(/\s+/g, " ").trim();

      setTitle(cleanTitle);
      setAuthors(authorList.join(", "));
      setYear(pubYear);
      setAbstract(cleanSummary);
      setArxivFetched({
        id: cleanId,
        title: cleanTitle,
        authors: authorList,
        year: pubYear,
        abstract: cleanSummary,
      });
    } catch (err) {
      console.warn("arXiv fetch failed:", err);
      setError("Could not retrieve arXiv metadata. Please check the arXiv ID or upload local PDF.");
      setTitle(cleanId);
    } finally {
      setIsFetchingArxiv(false);
    }
  };

  // ── Handle Local PDF Selection ────────────────────────────────────────────
  const handleFileChange = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF file.");
      return;
    }

    setError("");
    setSelectedFile(file);
    setIsReadingPdf(true);

    try {
      const blobUrl = URL.createObjectURL(file);
      setLocalPdfBlobUrl(blobUrl);

      // Guess title from filename: "2302.04761_Toolformer.pdf" -> "Toolformer"
      const cleanFileName = file.name
        .replace(/\.pdf$/i, "")
        .replace(/^[\d.-]+_/, "")
        .replace(/[_-]+/g, " ")
        .trim();
      setTitle(cleanFileName);

      // Inspect PDF with PDF.js to get total pages and metadata
      const loadingTask = pdfjsLib.getDocument(blobUrl);
      const pdf = await loadingTask.promise;
      setLocalPdfPageCount(pdf.numPages || 1);

      try {
        const meta = await pdf.getMetadata();
        if (meta?.info?.Title && meta.info.Title.trim().length > 3) {
          setTitle(meta.info.Title.trim());
        }
        if (meta?.info?.Author) {
          setAuthors(meta.info.Author.trim());
        }
      } catch {
        // Metadata reading is optional
      }
    } catch (err) {
      console.warn("Error reading local PDF:", err);
      setError("Could not parse PDF file, but you can still add it.");
    } finally {
      setIsReadingPdf(false);
    }
  };

  // ── Final Submit ──────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Paper title is required.");
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const cleanArxivId = activeTab === "arxiv" ? parseArxivId(arxivQuery) : null;

    let finalPdfUrl = null;
    if (activeTab === "local" && localPdfBlobUrl) {
      finalPdfUrl = localPdfBlobUrl;
    } else if (cleanArxivId) {
      finalPdfUrl = `/papers/${cleanArxivId}.pdf`;
    } else {
      finalPdfUrl = "/papers/2302.04761.pdf";
    }

    const newPaper = {
      id: `paper-${Date.now()}`,
      title: title.trim(),
      authors: authors.trim()
        ? authors.split(",").map((a) => a.trim()).filter(Boolean)
        : ["Unknown Author"],
      publication_year: parseInt(year, 10) || 2024,
      collection: collection,
      arxiv_id: cleanArxivId || null,
      pdf_url: finalPdfUrl,
      reading_status: readingStatus,
      currentPage: 1,
      totalPages: localPdfPageCount || 14,
      date_added: todayStr,
      created_at: new Date().toISOString(),
      abstract: abstract.trim(),
      notes: "",
      highlights: [],
      tags: [collection],
    };

    onAddPaper(newPaper);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-[#0e0e12] border border-[#262632] w-full max-w-xl rounded-[3px] shadow-2xl flex flex-col text-xs font-sans text-[#f4f4f6]">
        {/* Header */}
        <div className="h-10 px-3.5 border-b border-[#222228] flex items-center justify-between bg-[#141419]">
          <span className="font-serif font-semibold text-[#f4f4f6] text-sm flex items-center gap-2 tracking-tight">
            <span className="w-4 h-4 rounded-[2px] bg-amber-500 text-black flex items-center justify-center font-bold text-[10px] font-mono">
              +
            </span>
            <span>Add Research Paper</span>
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="text-[#71717a] hover:text-[#f4f4f6] text-sm font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Source Tabs */}
        <div className="flex border-b border-[#222228] bg-[#131317] text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab("arxiv");
              setError("");
            }}
            className={`flex-1 py-1.5 px-3 flex items-center justify-center gap-1.5 font-medium cursor-pointer transition-colors ${
              activeTab === "arxiv"
                ? "bg-[#0e0e12] text-amber-400 border-b-2 border-amber-500 font-semibold"
                : "text-[#71717a] hover:text-[#f4f4f6]"
            }`}
          >
            <IconLink className="w-3 h-3 text-current" />
            arXiv Link / ID
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("local");
              setError("");
            }}
            className={`flex-1 py-1.5 px-3 flex items-center justify-center gap-1.5 font-medium cursor-pointer transition-colors ${
              activeTab === "local"
                ? "bg-[#0e0e12] text-amber-400 border-b-2 border-amber-500 font-semibold"
                : "text-[#71717a] hover:text-[#f4f4f6]"
            }`}
          >
            <IconUpload className="w-3 h-3 text-current" />
            Local PDF File
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-2 border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs rounded-[2px]">
              {error}
            </div>
          )}

          {/* ── TAB 1: arXiv Link / ID ── */}
          {activeTab === "arxiv" && (
            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#71717a] uppercase tracking-wider mb-1">
                  // arXiv URL or Identifier
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={arxivQuery}
                    onChange={(e) => setArxivQuery(e.target.value)}
                    placeholder="e.g. 2302.04761 or https://arxiv.org/abs/2302.04761"
                    className="flex-1 px-2.5 py-1.5 bg-[#121217] border border-[#272733] text-[#f4f4f6] rounded-[2px] text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleFetchArxiv}
                    disabled={isFetchingArxiv || !arxivQuery.trim()}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black text-xs font-semibold rounded-[2px] cursor-pointer shrink-0 transition-colors"
                  >
                    {isFetchingArxiv ? "Fetching…" : "Fetch Details"}
                  </button>
                </div>
                <p className="text-[10px] text-[#52525b] mt-1">
                  Pulls title, authors, publication date, and abstract directly from arXiv.
                </p>
              </div>

              {arxivFetched && (
                <div className="p-2.5 bg-[#14141c] border border-[#262634] rounded-[2px] space-y-1 text-xs">
                  <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
                    ✓ Found on arXiv
                  </span>
                  <p className="font-medium text-[#f4f4f6]">{arxivFetched.title}</p>
                  <p className="text-[#71717a] text-[11px]">
                    {arxivFetched.authors.join(", ")} ({arxivFetched.year})
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: Local PDF File ── */}
          {activeTab === "local" && (
            <div className="space-y-2.5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
              />

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileChange(e.dataTransfer.files?.[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#282836] hover:border-amber-500/50 rounded-[3px] p-5 text-center cursor-pointer transition-colors bg-[#121217]"
              >
                <div className="w-6 h-6 mx-auto mb-1.5 text-[#71717a]">
                  <IconUpload className="w-6 h-6 text-[#71717a]" />
                </div>
                {selectedFile ? (
                  <div>
                    <p className="text-xs font-semibold text-amber-400 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-[#71717a] mt-0.5">
                      {formatBytes(selectedFile.size)} · {localPdfPageCount} pages
                    </p>
                    <span className="inline-block mt-1 text-[10px] text-[#a1a1aa] hover:underline">
                      Click to choose a different PDF
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-medium text-[#f4f4f6]">
                      Drag and drop local research PDF here
                    </p>
                    <p className="text-[10px] text-[#52525b] mt-0.5">
                      or click to browse from your filesystem
                    </p>
                  </div>
                )}
              </div>

              {isReadingPdf && (
                <p className="text-xs text-amber-400/80 italic animate-pulse">
                  // inspecting PDF document structure…
                </p>
              )}
            </div>
          )}

          {/* ── Metadata Inputs (Common to all tabs) ── */}
          <div className="pt-2 border-t border-[#1e1e26] space-y-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-[#71717a] uppercase tracking-wider mb-1">
                // Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Paper title"
                className="w-full px-2.5 py-1.5 bg-[#121217] border border-[#272733] text-[#f4f4f6] rounded-[2px] focus:outline-none focus:border-amber-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#71717a] uppercase tracking-wider mb-1">
                // Authors (comma separated)
              </label>
              <input
                type="text"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                placeholder="e.g. A. Vaswani, N. Shazeer"
                className="w-full px-2.5 py-1.5 bg-[#121217] border border-[#272733] text-[#f4f4f6] rounded-[2px] focus:outline-none focus:border-amber-500 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-[#71717a] uppercase tracking-wider mb-1">
                  // Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#121217] border border-[#272733] text-[#f4f4f6] rounded-[2px] text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#71717a] uppercase tracking-wider mb-1">
                  // Collection
                </label>
                <select
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#121217] border border-[#272733] text-[#f4f4f6] rounded-[2px] text-xs cursor-pointer focus:outline-none focus:border-amber-500 font-mono"
                >
                  {collections.map((c) => (
                    <option key={c.id} value={c.name} className="bg-[#18181f]">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#71717a] uppercase tracking-wider mb-1">
                  // Status
                </label>
                <select
                  value={readingStatus}
                  onChange={(e) => setReadingStatus(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#121217] border border-[#272733] text-[#f4f4f6] rounded-[2px] text-xs cursor-pointer focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="not read" className="bg-[#18181f]">not read</option>
                  <option value="read" className="bg-[#18181f]">read</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#71717a] uppercase tracking-wider mb-1">
                // Abstract
              </label>
              <textarea
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                rows={2}
                placeholder="Brief summary or abstract..."
                className="w-full px-2.5 py-1.5 bg-[#121217] border border-[#272733] text-[#f4f4f6] rounded-[2px] focus:outline-none focus:border-amber-500 text-xs leading-relaxed font-mono resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-[#1e1e26] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 border border-[#282836] hover:bg-[#181820] text-[#a1a1aa] rounded-[2px] text-xs cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-[2px] text-xs cursor-pointer transition-colors"
            >
              Add to Library
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPaperModal;
