"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import DocumentPreviewer from "@/components/DocumentPreviewer";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export default function ReviewerPortalPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  const [tokenInput, setTokenInput] = useState("");
  const [tokenError, setTokenError] = useState("");
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewPaper, setPreviewPaper] = useState(null);

  // Fetch papers that have been assigned / are under review
  const fetchAssignedPapers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/papers`);
      const data = await res.json();
      if (data.success) {
        // Filter papers that have a review token or are under review/revision/submitted
        setPapers(data.papers || []);
      } else {
        setError(data.error || "Failed to load papers.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to IntelliSubmit API Server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedPapers();
  }, []);

  const handleOpenToken = (e) => {
    e.preventDefault();
    const cleanToken = tokenInput.trim();
    if (!cleanToken) {
      setTokenError("Please enter a review token.");
      return;
    }
    // If user pasted a full URL e.g. http://localhost:3000/review/xyz, extract token
    if (cleanToken.includes("/review/")) {
      const parts = cleanToken.split("/review/");
      router.push(`/review/${parts[1]}`);
    } else {
      router.push(`/review/${cleanToken}`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Under Review":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Under Review
          </span>
        );
      case "Revision Requested":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Revision Requested
          </span>
        );
      case "Resubmitted":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            Resubmitted (Action Needed)
          </span>
        );
      case "Published":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Published
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950">
                Reviewer Portal
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Peer review assessment & manuscript evaluation
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-2">
              Reviewer Workspace & Queue
            </h1>
          </div>

          {user && (
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{user.name}</span>
              <span className="text-zinc-400">({user.email})</span>
            </div>
          )}
        </div>

        {/* Access Manuscript by Token Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Access Manuscript via Custom Review Token or URL
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Received a review link from the editorial administrator? Enter or paste it below to open the review workspace.
              </p>
            </div>
          </div>

          <form onSubmit={handleOpenToken} className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => {
                setTokenInput(e.target.value);
                setTokenError("");
              }}
              placeholder="Paste token (e.g. 84a8d38e-...) or full review link..."
              className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
            >
              Open Review Workspace
            </button>
          </form>
          {tokenError && (
            <p className="text-xs text-rose-600 font-medium">{tokenError}</p>
          )}
        </div>

        {/* Assigned Manuscripts Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Manuscripts Available for Review ({papers.length})
            </h2>
            <button
              onClick={fetchAssignedPapers}
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium"
            >
              Refresh Queue
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <div className="w-8 h-8 mx-auto border-3 border-zinc-300 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-xs text-zinc-500 mt-3">Loading review queue...</p>
            </div>
          ) : papers.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 space-y-2">
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No manuscripts currently awaiting review</p>
              <p className="text-xs text-zinc-400">When editors assign a paper, you will find it in this queue.</p>
            </div>
          ) : (
            papers.map((paper) => {
              const reviewLink = paper.reviewToken ? `/review/${paper.reviewToken}` : null;

              return (
                <div
                  key={paper._id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(paper.status)}
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {paper.category}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                          Review Round: {paper.reviewCount || 0}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                        {paper.title}
                      </h3>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Authors: {Array.isArray(paper.authors) ? paper.authors.join(", ") : paper.authors} • Submitted on {new Date(paper.createdAt).toLocaleDateString()}
                      </p>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {paper.abstract}
                      </p>

                      {paper.status === "Resubmitted" && (
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 rounded-xl text-xs text-purple-900 dark:text-purple-200 space-y-1">
                          <p className="font-bold">Author's Resubmission Notes:</p>
                          <p className="whitespace-pre-wrap">{paper.latestRevisionNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                      {reviewLink ? (
                        <Link
                          href={reviewLink}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs text-center flex items-center justify-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.264 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Open Review Workspace
                        </Link>
                      ) : (
                        <span className="text-[11px] text-zinc-400 italic py-2">
                          Token pending admin dispatch
                        </span>
                      )}

                      <button
                        onClick={() => setPreviewPaper(paper)}
                        className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                      >
                        Preview Manuscript
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL: DOCUMENT PREVIEW */}
        {previewPaper && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    {previewPaper.title}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    File: {previewPaper.file?.originalName}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewPaper(null)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl font-bold cursor-pointer"
                >
                  ×
                </button>
              </div>
              <DocumentPreviewer
                fileUrl={previewPaper.file?.url}
                fileName={previewPaper.file?.originalName}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
