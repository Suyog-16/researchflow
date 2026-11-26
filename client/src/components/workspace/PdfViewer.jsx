import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const { TextLayer } = pdfjsLib;

// Highlight colors with translucent highlighter appearance
const HIGHLIGHT_COLORS = {
  green: "rgba(34, 197, 94, 0.38)",
  yellow: "rgba(234, 179, 8, 0.38)",
  red: "rgba(239, 68, 68, 0.32)",
  blue: "rgba(59, 130, 246, 0.32)",
};

// Merge fragmented per-span DOMRects into clean, continuous line rectangles
function mergeLineRects(rects) {
  if (!rects || rects.length === 0) return [];

  // Sort by vertical position (top), then horizontal (left)
  const sorted = [...rects].sort((a, b) => {
    const yDiff = a.y - b.y;
    if (Math.abs(yDiff) > 3) return yDiff;
    return a.x - b.x;
  });

  const lines = [];

  for (const r of sorted) {
    // Find if rect belongs to an existing text line
    const lineIndex = lines.findIndex((l) => {
      const verticalOverlap =
        Math.min(l.bottom, r.y + r.height) - Math.max(l.y, r.y);
      const minHeight = Math.min(l.height, r.height);
      const isSameLine = verticalOverlap > minHeight * 0.5;

      if (!isSameLine) return false;

      // Allow merging if horizontally adjacent or overlapping
      const horizontalGap = r.x - l.right;
      return horizontalGap < 20 && l.x <= r.x + r.width + 20;
    });

    if (lineIndex !== -1) {
      const line = lines[lineIndex];
      const newLeft = Math.min(line.x, r.x);
      const newRight = Math.max(line.right, r.x + r.width);
      const newTop = Math.min(line.y, r.y);
      const newBottom = Math.max(line.bottom, r.y + r.height);

      line.x = newLeft;
      line.right = newRight;
      line.width = newRight - newLeft;
      line.y = newTop;
      line.bottom = newBottom;
      line.height = newBottom - newTop;
    } else {
      lines.push({
        x: r.x,
        y: r.y,
        right: r.x + r.width,
        bottom: r.y + r.height,
        width: r.width,
        height: r.height,
      });
    }
  }

  return lines.map((l) => ({
    x: l.x,
    y: l.y,
    width: l.width,
    height: l.height,
  }));
}

// Color picker popup that appears on text selection
function ColorPicker({ position, onSelect, onDismiss }) {
  const colors = [
    { key: "green", label: "Useful", dot: "#22c55e" },
    { key: "yellow", label: "Normal", dot: "#eab308" },
    { key: "red", label: "Don't Know", dot: "#ef4444" },
    { key: "blue", label: "Math", dot: "#3b82f6" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: `${position.y}px`,
        left: `${position.x}px`,
        zIndex: 9999,
      }}
      className="bg-neutral-900/95 text-white backdrop-blur-sm rounded-md shadow-2xl px-2 py-1.5 flex items-center gap-1.5 border border-neutral-700 text-xs select-none animate-in fade-in zoom-in-95 duration-100"
    >
      <span className="text-neutral-400 pr-1.5 border-r border-neutral-700 font-medium text-[11px]">
        Highlight
      </span>
      {colors.map(({ key, label, dot }) => (
        <button
          key={key}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(key);
          }}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-neutral-800 cursor-pointer font-medium text-[11px] transition-colors"
          title={`Highlight as ${label}`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
            style={{ background: dot }}
          />
          {label}
        </button>
      ))}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDismiss();
        }}
        className="text-neutral-400 hover:text-white px-1 text-xs cursor-pointer ml-0.5"
        title="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

// Single PDF page rendered via canvas + text layer overlay
function PdfPage({ page, scale, pageNum, highlights }) {
  const canvasRef = useRef(null);
  const textLayerContainerRef = useRef(null);
  const containerRef = useRef(null);
  const renderTaskRef = useRef(null);

  const viewport = page.getViewport({ scale });
  const width = Math.floor(viewport.width);
  const height = Math.floor(viewport.height);

  // Render canvas (with high-DPI devicePixelRatio) and text layer
  useEffect(() => {
    const canvas = canvasRef.current;
    const textLayerContainer = textLayerContainerRef.current;
    if (!canvas || !textLayerContainer) return;

    const ctx = canvas.getContext("2d");

    // Cancel any in-progress render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    // High-DPI support: render at device pixel ratio for razor-sharp vector text
    const dpr = window.devicePixelRatio || 1;
    const vp = page.getViewport({ scale });
    const w = Math.floor(vp.width);
    const h = Math.floor(vp.height);

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null;
    const task = page.render({
      canvasContext: ctx,
      viewport: vp,
      transform,
    });
    renderTaskRef.current = task;

    // Build the TextLayer inside an unmanaged DOM container so React never conflicts with it
    textLayerContainer.innerHTML = "";
    const textLayerDiv = document.createElement("div");
    textLayerDiv.className = "textLayer";
    textLayerDiv.style.setProperty("--scale-factor", scale);
    textLayerDiv.style.setProperty("--total-scale-factor", scale);
    textLayerDiv.style.setProperty("--user-unit", "1");
    textLayerDiv.style.setProperty("--scale-round-x", "1px");
    textLayerDiv.style.setProperty("--scale-round-y", "1px");
    textLayerDiv.style.position = "absolute";
    textLayerDiv.style.inset = "0";
    textLayerDiv.style.width = `${w}px`;
    textLayerDiv.style.height = `${h}px`;
    textLayerDiv.style.zIndex = "2";
    textLayerContainer.appendChild(textLayerDiv);

    // Track selection state on the text layer
    const onPointerDown = () => {
      textLayerDiv.classList.add("selecting");
    };
    const onPointerUp = () => {
      textLayerDiv.classList.remove("selecting");
    };
    textLayerDiv.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    task.promise
      .then(() => {
        renderTaskRef.current = null;
        return page.getTextContent();
      })
      .then((textContent) => {
        const vp2 = page.getViewport({ scale });
        const tl = new TextLayer({
          textContentSource: textContent,
          container: textLayerDiv,
          viewport: vp2,
        });
        return tl.render();
      })
      .then(() => {
        // Append endOfContent marker for smooth native selection
        const endOfContent = document.createElement("div");
        endOfContent.className = "endOfContent";
        textLayerDiv.appendChild(endOfContent);
      })
      .catch((err) => {
        if (err?.name !== "RenderingCancelledException") {
          console.warn("PDF render error:", err);
        }
      });

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      textLayerDiv.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [page, scale]);

  const pageHighlights = highlights.filter((h) => h.pageNum === pageNum);

  return (
    <div
      ref={containerRef}
      data-page={pageNum}
      className="relative mb-6 bg-white shadow-md border border-neutral-300 rounded-xs select-text"
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {/* Canvas layer */}
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: `${width}px`, height: `${height}px` }}
      />

      {/* Highlight overlay layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {pageHighlights.map((hl) => {
          const merged = mergeLineRects(hl.rects || []);
          return merged.map((r, ri) => (
            <div
              key={`${hl.id}-${ri}`}
              style={{
                position: "absolute",
                left: `${r.x * scale}px`,
                top: `${r.y * scale}px`,
                width: `${r.width * scale}px`,
                height: `${r.height * scale}px`,
                backgroundColor: HIGHLIGHT_COLORS[hl.color] || HIGHLIGHT_COLORS.yellow,
                borderRadius: "2px",
                mixBlendMode: "multiply",
                pointerEvents: "none",
              }}
            />
          ));
        })}
      </div>

      {/* Text layer container - populated and managed by PDF.js */}
      <div
        ref={textLayerContainerRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
        }}
      />
    </div>
  );
}

// Main PDF Viewer component
const PdfViewer = forwardRef(function PdfViewer(
  { pdfUrl, scale = 1.4, highlights = [], onHighlightCreated, onPageVisible },
  ref
) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  // Global floating highlight picker
  const [picker, setPicker] = useState(null);

  useImperativeHandle(ref, () => ({
    scrollToPage(pageNum) {
      const container = containerRef.current;
      if (!container) return;
      const pageEl = container.querySelector(`[data-page="${pageNum}"]`);
      if (pageEl) {
        pageEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
  }));

  // Close picker when selection collapses naturally (e.g. click to deselect)
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPicker(null);
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  // Detect text selection on mouseup within the PDF document
  const handleMouseUp = useCallback(() => {
    // Small timeout to allow browser selection range to settle
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPicker(null);
        return;
      }

      const selectedText = selection.toString().trim();
      if (selectedText.length < 2) {
        setPicker(null);
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const range = selection.getRangeAt(0);

      // Identify which PDF page element contains the selection
      const anchorNode = range.commonAncestorContainer;
      const el = anchorNode.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode.parentElement;
      const pageEl = el?.closest("[data-page]");
      if (!pageEl || !container.contains(pageEl)) return;

      const pageNum = parseInt(pageEl.getAttribute("data-page"), 10);
      if (!pageNum) return;

      const clientRects = Array.from(range.getClientRects()).filter(
        (r) => r.width > 0 && r.height > 0
      );
      if (clientRects.length === 0) return;

      const pageRect = pageEl.getBoundingClientRect();

      const rawRects = clientRects.map((r) => ({
        x: (r.left - pageRect.left) / scale,
        y: (r.top - pageRect.top) / scale,
        width: r.width / scale,
        height: r.height / scale,
      }));

      const rects = mergeLineRects(rawRects);

      const selectionRect = range.getBoundingClientRect();
      const pickerX = Math.max(
        16,
        Math.min(window.innerWidth - 320, selectionRect.left + selectionRect.width / 2 - 130)
      );
      const pickerY = selectionRect.top > 56 ? selectionRect.top - 42 : selectionRect.bottom + 8;

      setPicker({
        x: pickerX,
        y: pickerY,
        text: selectedText,
        rects,
        pageNum,
      });
    }, 10);
  }, [scale]);

  const handleColorSelect = useCallback(
    (colorKey) => {
      if (!picker) return;
      const newHighlight = {
        id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        pageNum: picker.pageNum,
        color: colorKey,
        text: picker.text,
        rects: picker.rects,
        note: "",
        createdAt: new Date().toISOString(),
      };
      window.getSelection()?.removeAllRanges();
      setPicker(null);
      onHighlightCreated(newHighlight);
    },
    [picker, onHighlightCreated]
  );

  const handleDismiss = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setPicker(null);
  }, []);

  useEffect(() => {
    if (!pdfUrl) return;

    let cancelled = false;

    const timerId = setTimeout(() => {
      if (!cancelled) {
        setLoading(true);
        setError(null);
        setPages([]);
      }
    }, 0);

    const load = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const pageObjs = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const p = await pdf.getPage(i);
          if (cancelled) return;
          pageObjs.push(p);
        }
        setPages(pageObjs);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load PDF");
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
      clearTimeout(timerId);
    };
  }, [pdfUrl]);

  // Track currently visible page during scrolling
  useEffect(() => {
    if (!onPageVisible || pages.length === 0) return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            const pageNum = parseInt(entry.target.getAttribute("data-page"), 10);
            if (!isNaN(pageNum)) {
              onPageVisible(pageNum);
            }
          }
        }
      },
      {
        root: null,
        threshold: 0.4,
      }
    );

    const pageElements = container.querySelectorAll("[data-page]");
    pageElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [pages, onPageVisible]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-500 text-sm gap-2">
        <div className="w-5 h-5 border-2 border-neutral-400 border-t-neutral-800 rounded-full animate-spin" />
        <span className="font-medium text-xs">Loading document…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-rose-600 text-sm text-center px-8">
        <div className="max-w-md bg-white p-6 rounded border border-rose-200 shadow-xs">
          <p className="font-semibold mb-1 text-rose-800">Could not load PDF</p>
          <p className="text-xs text-neutral-600 mb-3">{error}</p>
          <p className="text-xs text-neutral-400">
            Please verify the PDF file exists or try opening in an external tab.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      className="flex flex-col items-center py-8 px-4 select-text"
    >
      {pages.map((page, idx) => {
        const pageNum = idx + 1;
        return (
          <PdfPage
            key={pageNum}
            page={page}
            scale={scale}
            pageNum={pageNum}
            highlights={highlights}
          />
        );
      })}

      {/* Global floating ColorPicker */}
      {picker && (
        <ColorPicker
          position={{ x: picker.x, y: picker.y }}
          onSelect={handleColorSelect}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
});

export default PdfViewer;
