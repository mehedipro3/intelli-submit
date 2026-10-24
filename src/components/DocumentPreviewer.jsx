"use client";

import { useState, useEffect } from "react";

export default function DocumentPreviewer({ fileUrl, fileObj, fileName, className = "" }) {
  const [docHtml, setDocHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewType, setPreviewType] = useState("unknown"); // 'pdf' | 'docx' | 'doc' | 'unknown'
  const [activeTab, setActiveTab] = useState("preview"); // 'preview' | 'info'

  // Determine file type and URL
  const effectiveFileName = fileName || fileObj?.name || (fileUrl ? fileUrl.split("/").pop() : "document");
  const ext = effectiveFileName.split(".").pop()?.toLowerCase();
  const effectiveUrl = fileUrl || (fileObj ? URL.createObjectURL(fileObj) : null);

  useEffect(() => {
    let isMounted = true;
    setError(null);
    setDocHtml("");

    if (!ext) {
      setPreviewType("unknown");
      return;
    }

    if (ext === "pdf") {
      setPreviewType("pdf");
    } else if (ext === "docx") {
      setPreviewType("docx");
      setLoading(true);

      const loadDocx = async () => {
        try {
          let arrayBuffer;
          if (fileObj) {
            arrayBuffer = await fileObj.arrayBuffer();
          } else if (fileUrl) {
            const res = await fetch(fileUrl);
            if (!res.ok) throw new Error("Failed to load document file");
            arrayBuffer = await res.arrayBuffer();
          }

          if (arrayBuffer && isMounted) {
            const mammoth = await import("mammoth");
            const result = await mammoth.convertToHtml({ arrayBuffer });
            if (isMounted) {
              setDocHtml(result.value || "<p><em>Document contains no readable text content.</em></p>");
            }
          }
        } catch (err) {
          console.error("DOCX rendering error:", err);
          if (isMounted) {
            setError("Could not render DOCX preview. You can still download the file directly.");
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      loadDocx();
    } else if (ext === "doc") {
      setPreviewType("doc");
    } else {
      setPreviewType("unknown");
    }

    return () => {
      isMounted = false;
    };
  }, [fileUrl, fileObj, ext]);

  return (
    <div className={`flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm ${className}`}>
      {/* Viewer Header / Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold uppercase">
            {ext || "DOC"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-xs md:max-w-md">
              {effectiveFileName}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 capitalize">
              {ext === "pdf" ? "PDF Document" : ext === "docx" ? "Word Document (.docx)" : ext === "doc" ? "Legacy Word (.doc)" : "Document File"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {effectiveUrl && (
            <a
              href={effectiveUrl}
              download={effectiveFileName}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition-colors shadow-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          )}
          {effectiveUrl && ext === "pdf" && (
            <a
              href={effectiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition-colors shadow-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open New Tab
            </a>
          )}
        </div>
      </div>

      {/* Viewer Body */}
      <div className="relative min-h-[420px] max-h-[680px] h-[580px] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center justify-center">
        {loading && (
          <div className="flex flex-col items-center gap-2 p-8 text-center">
            <div className="w-8 h-8 border-3 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100 rounded-full animate-spin" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Rendering preview...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-8 text-center max-w-md">
            <div className="mx-auto w-10 h-10 mb-3 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 mb-1">{error}</p>
            {effectiveUrl && (
              <a
                href={effectiveUrl}
                download={effectiveFileName}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity"
              >
                Download Document
              </a>
            )}
          </div>
        )}

        {/* PDF Previewer */}
        {!loading && !error && previewType === "pdf" && effectiveUrl && (
          <iframe
            src={`${effectiveUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            title="PDF Preview"
            className="w-full h-full border-none"
          />
        )}

        {/* DOCX In-Browser HTML Previewer */}
        {!loading && !error && previewType === "docx" && (
          <div className="w-full h-full overflow-y-auto p-4 sm:p-6 md:p-8 flex justify-center bg-zinc-200/60 dark:bg-zinc-950/70">
            <div className="w-full max-w-3xl min-h-[500px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg p-8 sm:p-12 text-zinc-900 dark:text-zinc-100 prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed docx-preview-content">
              <div
                dangerouslySetInnerHTML={{ __html: docHtml }}
                className="space-y-4"
              />
            </div>
          </div>
        )}

        {/* DOC Legacy Fallback */}
        {!loading && !error && previewType === "doc" && (
          <div className="p-8 text-center max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
            <div className="mx-auto w-12 h-12 mb-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-base">
              DOC
            </div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Legacy Word Document (.doc)
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-4 leading-relaxed">
              In-browser preview is available for PDF and modern Word (.docx) files. To inspect this document, please download it or open in Microsoft Word or LibreOffice.
            </p>
            {effectiveUrl && (
              <a
                href={effectiveUrl}
                download={effectiveFileName}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download .doc File
              </a>
            )}
          </div>
        )}

        {/* Unknown File Type */}
        {!loading && !error && previewType === "unknown" && (
          <div className="p-6 text-center text-xs text-zinc-400">
            No document selected or unsupported file format.
          </div>
        )}
      </div>
    </div>
  );
}
