"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DocumentPreviewer from "@/components/DocumentPreviewer";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export default function ReviewerWorkspace({ token }) {
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [decisionSuccess, setDecisionSuccess] = useState(null); // { message, newStatus }

  // Review Form State
  const [feedback, setFeedback] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [activeView, setActiveView] = useState("split"); // "split" | "document" | "feedback"

  const fetchPaper = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/papers/review/${token}`);
      const data = await res.json();
      if (data.success && data.paper) {
        setPaper(data.paper);
      } else {
        setError(data.error || "Invalid or expired review link.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the IntelliSubmit server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPaper();
    }
  }, [token]);

  const handleSubmitReview = async (decision) => {
    if (decision === "revision_requested" && (!feedback || feedback.trim().length === 0)) {
      alert("Please provide detailed feedback and required changes for the author.");
      return;
    }

    const confirmMessage =
      decision === "publish"
        ? "Are you sure you want to approve this paper for publication? This will mark the paper as Published."
        : "Are you sure you want to request revisions from the author? Your feedback will be sent to them.";

    if (!window.confirm(confirmMessage)) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/papers/review/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          feedback,
          reviewerName,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setPaper(data.paper);
        setDecisionSuccess({
          message: data.message,
          newStatus: data.paper.status,
          decision,
        });
      } else {
        alert(data.error || "Failed to submit review.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-zinc-500 mt-4">
          Loading manuscript for peer review...
        </p>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Review Link Error</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">{error}</p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold rounded-xl hover:opacity-90"
          >
            Return to IntelliSubmit
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Top Reviewer Bar */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-xs">
              PR
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  Reviewer Workspace
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  Round #{paper.reviewCount + 1}
                </span>
                {paper.status === "Published" && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Published
                  </span>
                )}
              </div>
              <h1 className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-md sm:max-w-xl">
                {paper.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {paper.file?.url && (
              <a
                href={paper.file.url}
                download={paper.file.originalName}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download File
              </a>
            )}
            <Link
              href="/"
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium px-2 py-1"
            >
              Exit
            </Link>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Decision Banner if already decided in this session */}
        {decisionSuccess && (
          <div
            className={`p-5 rounded-2xl border text-xs shadow-sm flex items-start gap-3 ${
              decisionSuccess.decision === "publish"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-200"
                : "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-200"
            }`}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-white/80 dark:bg-zinc-900/80 font-bold">
              {decisionSuccess.decision === "publish" ? "✓" : "!"}
            </div>
            <div>
              <p className="font-bold text-sm">{decisionSuccess.message}</p>
              <p className="text-[11px] opacity-80 mt-1">
                Status is now updated to: <strong>{decisionSuccess.newStatus}</strong>. The author has been notified.
              </p>
            </div>
          </div>
        )}

        {/* Paper Overview Header Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {paper.category}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                Review Count: {paper.reviewCount || 0}
              </span>
            </div>
            <span className="text-xs text-zinc-400">
              Submitted: {new Date(paper.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              {paper.title}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              <strong>Authors:</strong> {Array.isArray(paper.authors) ? paper.authors.join(", ") : paper.authors}
            </p>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800/80 leading-relaxed">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">Abstract:</span>
            {paper.abstract}
          </div>

          {/* Resubmission alert with author's notes if applicable */}
          {paper.status === "Resubmitted" && (
            <div className="p-4 bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 rounded-xl text-xs text-purple-900 dark:text-purple-200 space-y-1">
              <p className="font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                Author Resubmission & Response to Previous Review:
              </p>
              <p className="whitespace-pre-wrap leading-relaxed">
                {paper.latestRevisionNotes || "The author has uploaded a revised manuscript addressing your previous comments."}
              </p>
            </div>
          )}

          {/* Previous Review History */}
          {paper.reviewHistory && paper.reviewHistory.length > 0 && (
            <details className="text-xs group pt-1">
              <summary className="font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 select-none">
                <span>View Previous Review Rounds ({paper.reviewHistory.length})</span>
              </summary>
              <div className="mt-3 space-y-2.5 pl-3 border-l-2 border-zinc-200 dark:border-zinc-800">
                {paper.reviewHistory.map((item, idx) => (
                  <div key={idx} className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        Round {item.round} • {item.decision === "publish" ? "Approved & Published" : "Revision Requested"}
                      </span>
                      <span className="text-zinc-400">
                        {new Date(item.reviewedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {item.feedback && (
                      <p className="text-zinc-600 dark:text-zinc-300 text-[11px] whitespace-pre-wrap">
                        {item.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Split Grid: Document Previewer + Review Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Document Viewer (7 Cols) */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white" />
                Manuscript Viewer
              </h3>
              <span className="text-[11px] text-zinc-400">
                {paper.file?.originalName}
              </span>
            </div>
            <DocumentPreviewer
              fileUrl={paper.file?.url}
              fileName={paper.file?.originalName}
              className="h-[650px]"
            />
          </div>

          {/* Review Decision & Feedback Form (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5 sticky top-20">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Submit Your Recommendation
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Evaluate the manuscript and provide actionable feedback for the author or approve it for publishing.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Reviewer Name / Alias (Optional)
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Peer Reviewer #1"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Review Feedback & Comments *
                </label>
                <textarea
                  rows={8}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide your assessment of the methodology, clarity, citations, and any required revisions or fixes needed before publication..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white leading-relaxed resize-y"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Required if requesting changes. This will be sent directly to the author.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                {/* Send for Revision */}
                <button
                  type="button"
                  onClick={() => handleSubmitReview("revision_requested")}
                  disabled={submitting}
                  className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {submitting ? "Submitting..." : "Send for Review / Request Revision"}
                </button>

                {/* Approve & Publish */}
                <button
                  type="button"
                  onClick={() => handleSubmitReview("publish")}
                  disabled={submitting}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {submitting ? "Publishing..." : "Approve & Publish Paper"}
                </button>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl text-[11px] text-zinc-500 leading-relaxed border border-zinc-100 dark:border-zinc-800">
              <strong>Workflow Note:</strong> If revision is requested, the author will receive your comments and will be able to resubmit an updated file, which will be returned for re-review.
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
