"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import DocumentPreviewer from "@/components/DocumentPreviewer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AuthorPortalPage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [activeTab, setActiveTab] = useState("papers"); // "papers" | "submit"
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");

  // New paper form state
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [authors, setAuthors] = useState("");
  const [category, setCategory] = useState("Computer Science & AI");
  const [keywords, setKeywords] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Resubmit modal state
  const [resubmitModalOpen, setResubmitModalOpen] = useState(false);
  const [paperToResubmit, setPaperToResubmit] = useState(null);
  const [resubmitFile, setResubmitFile] = useState(null);
  const [resubmitNotes, setResubmitNotes] = useState("");
  const [resubmitting, setResubmitting] = useState(false);

  // Document preview modal
  const [previewPaper, setPreviewPaper] = useState(null);

  useEffect(() => {
    if (user?.email) {
      setAuthorEmail(user.email);
      if (!authors && user.name) {
        setAuthors(user.name);
      }
      fetchAuthorPapers(user.email);
    } else {
      setAuthorEmail("");
      setPapers([]);
    }
  }, [user]);

  const fetchAuthorPapers = async (emailToFetch) => {
    if (!emailToFetch) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/papers/author?email=${encodeURIComponent(emailToFetch)}`);
      const data = await res.json();
      if (data.success) {
        setPapers(data.papers || []);
      } else {
        setError(data.error || "Failed to load papers");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to IntelliSubmit API server.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError("");
    if (!file) return;

    const allowed = [".pdf", ".doc", ".docx"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowed.includes(ext)) {
      setFileError("Please upload a PDF (.pdf), Word (.docx), or legacy Word (.doc) file.");
      setSelectedFile(null);
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setFileError("File size exceeds 30MB limit.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmitPaper = async (e) => {
    e.preventDefault();

    // STRICT CHECK: User must be logged in to submit
    if (!user) {
      setError("Authentication required: You must be logged in to submit a manuscript.");
      return;
    }

    if (!selectedFile) {
      setFileError("Please attach your manuscript document file.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("abstract", abstract);
      formData.append("authors", authors);
      formData.append("category", category);
      formData.append("keywords", keywords);
      formData.append("authorEmail", user.email);
      formData.append("authorName", user.name || authors.split(",")[0] || "Author");
      formData.append("file", selectedFile);

      const res = await fetch(`${API_BASE}/api/papers`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setSubmitSuccess(true);
        setTitle("");
        setAbstract("");
        setKeywords("");
        setSelectedFile(null);
        fetchAuthorPapers(user.email);
        setTimeout(() => {
          setSubmitSuccess(false);
          setActiveTab("papers");
        }, 1500);
      } else {
        setError(data.error || "Failed to submit paper");
      }
    } catch (err) {
      console.error(err);
      setError("Network error when submitting paper.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenResubmit = (paper) => {
    setPaperToResubmit(paper);
    setResubmitFile(null);
    setResubmitNotes("");
    setResubmitModalOpen(true);
  };

  const handleResubmitPaper = async (e) => {
    e.preventDefault();
    if (!paperToResubmit) return;

    setResubmitting(true);
    try {
      const formData = new FormData();
      if (resubmitFile) {
        formData.append("file", resubmitFile);
      }
      formData.append("revisionNotes", resubmitNotes);

      const res = await fetch(`${API_BASE}/api/papers/${paperToResubmit._id}/resubmit`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setResubmitModalOpen(false);
        setPaperToResubmit(null);
        if (user?.email) fetchAuthorPapers(user.email);
      } else {
        alert(data.error || "Failed to resubmit paper");
      }
    } catch (err) {
      console.error(err);
      alert("Network error during resubmission.");
    } finally {
      setResubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Submitted":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Submitted (Pending Admin)
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
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
            Resubmitted
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
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-blue-600 text-white dark:bg-blue-500 dark:text-zinc-950">
                Author Portal
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Manuscript submission & peer review dashboard
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-2">
              Manuscript Submissions
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("papers")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "papers"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                  : "bg-white text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              My Submissions ({papers.length})
            </button>
            <button
              onClick={() => setActiveTab("submit")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "submit"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                  : "bg-white text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="text-base leading-none">+</span> Submit New Paper
            </button>
          </div>
        </div>

        {/* User Authentication Status Banner */}
        {!user && !isPending && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-200 dark:bg-amber-900/60 font-bold">
                !
              </span>
              <div>
                <p className="font-bold">You are not logged in</p>
                <p className="text-amber-700 dark:text-amber-300 text-[11px]">
                  You must be logged in to an author account to submit research papers and track reviews.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/login"
                className="px-3.5 py-1.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold rounded-xl text-xs hover:opacity-90"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Register
              </Link>
            </div>
          </div>
        )}

        {/* TAB 1: SUBMISSIONS LIST */}
        {activeTab === "papers" && (
          <div className="space-y-6">
            {!user ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 space-y-4 shadow-sm max-w-xl mx-auto">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Sign In to View Your Submissions
                </h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Please log in with your author credentials to view your submitted research papers, reviewer decisions, and revision requests.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Link
                    href="/login"
                    className="px-5 py-2 text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl hover:opacity-90 shadow-sm"
                  >
                    Log In Now
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    Register as Author
                  </Link>
                </div>
              </div>
            ) : loading ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <div className="w-8 h-8 mx-auto border-3 border-zinc-300 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs text-zinc-500 mt-3">Loading your submissions...</p>
              </div>
            ) : papers.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 space-y-4 shadow-sm">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  No manuscripts submitted yet
                </h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Submit your research paper with a PDF, DOC, or DOCX document to begin the peer review process.
                </p>
                <button
                  onClick={() => setActiveTab("submit")}
                  className="px-4 py-2 text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl hover:opacity-90 shadow-sm cursor-pointer"
                >
                  Submit Your First Paper
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {papers.map((paper) => (
                  <div
                    key={paper._id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          {getStatusBadge(paper.status)}
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            {paper.category || "General"}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                            Review Rounds: {paper.reviewCount || 0}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight pt-1">
                          {paper.title}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Authors: {Array.isArray(paper.authors) ? paper.authors.join(", ") : paper.authors} • Submitted on{" "}
                          {new Date(paper.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Document Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setPreviewPaper(paper)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.264 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Preview Document
                        </button>
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
                            Download
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Abstract */}
                    <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed border border-zinc-100 dark:border-zinc-800/80">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-1">Abstract:</span>
                      {paper.abstract}
                    </div>

                    {/* REVISION REQUESTED CALLOUT */}
                    {paper.status === "Revision Requested" && (
                      <div className="p-4 sm:p-5 rounded-xl bg-rose-50/70 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs uppercase tracking-wide">
                            <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Reviewer Feedback (Round #{paper.reviewCount})
                          </div>
                          <button
                            onClick={() => handleOpenResubmit(paper)}
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          >
                            Resubmit Revised Paper
                          </button>
                        </div>
                        <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed bg-white/60 dark:bg-zinc-900/60 p-3 rounded-lg border border-rose-100 dark:border-rose-900/30 whitespace-pre-wrap">
                          {paper.lastFeedback || "Please review the reviewer's instructions and upload an updated revision."}
                        </p>
                      </div>
                    )}

                    {/* Resubmitted Status Notice */}
                    {paper.status === "Resubmitted" && (
                      <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 dark:bg-purple-950/30 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-200 flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Revision Submitted to Admin</p>
                          <p className="text-[11px] text-purple-700 dark:text-purple-300">
                            Your updated manuscript has been delivered to the editor. Admin will pass it down to the reviewer.
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-bold rounded text-[10px]">
                          Pending Reviewer
                        </span>
                      </div>
                    )}

                    {/* Review History Accordion / List */}
                    {paper.reviewHistory && paper.reviewHistory.length > 0 && (
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                        <details className="text-xs group">
                          <summary className="font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 select-none">
                            <span>Review History ({paper.reviewHistory.length} entries)</span>
                          </summary>
                          <div className="mt-3 space-y-2.5 pl-2 border-l-2 border-zinc-200 dark:border-zinc-800">
                            {paper.reviewHistory.map((item, idx) => (
                              <div key={idx} className="bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-lg space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                    Round {item.round} • {item.decision === "publish" ? "Approved for Publication" : "Revision Requested"}
                                  </span>
                                  <span className="text-zinc-400">
                                    {new Date(item.reviewedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                {item.feedback && (
                                  <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap text-[11px]">
                                    {item.feedback}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SUBMIT NEW PAPER FORM */}
        {activeTab === "submit" && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            {/* STRICT LOGIN BARRIER IF NOT AUTHENTICATED */}
            {!user ? (
              <div className="py-12 px-4 text-center max-w-xl mx-auto space-y-5">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Sign In Required to Submit
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
                    Authors cannot submit papers without being logged in. Please sign in to your account or register as an Author to submit your manuscript and track the peer review process.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/login"
                    className="px-6 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-xs font-bold hover:opacity-90 shadow-sm transition-all"
                  >
                    Log In to Submit Paper
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Create Author Account
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="max-w-3xl mb-8">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Submit a Manuscript
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Upload your research paper in PDF, DOC, or DOCX format. Submitting as <strong>{user.name}</strong> ({user.email}).
                  </p>
                </div>

                {submitSuccess && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300">
                    ✓ Paper submitted successfully! Admin will assign it to a reviewer. Redirecting...
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmitPaper} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                        Paper Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Distributed Consensus in Asynchronous Byzantine Networks"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                        Authors (comma-separated) *
                      </label>
                      <input
                        type="text"
                        required
                        value={authors}
                        onChange={(e) => setAuthors(e.target.value)}
                        placeholder="e.g. Alice Smith, Bob Jones, Carol Danvers"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                        Category / Track
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                      >
                        <option value="Computer Science & AI">Computer Science & AI</option>
                        <option value="Information Security">Information Security</option>
                        <option value="Data Science & ML">Data Science & ML</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Bioinformatics">Bioinformatics</option>
                        <option value="Other / General">Other / General</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                        Keywords (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="e.g. Distributed Systems, Consensus, Cryptography"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                        Abstract *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={abstract}
                        onChange={(e) => setAbstract(e.target.value)}
                        placeholder="Provide a comprehensive summary of your paper's background, methodology, and key contributions..."
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* File Upload Zone */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Manuscript File (.pdf, .doc, .docx) *
                    </label>
                    <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 text-center hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors bg-zinc-50/50 dark:bg-zinc-950/30">
                      <input
                        type="file"
                        id="paper-file-input"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="paper-file-input"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-white">
                            {selectedFile ? selectedFile.name : "Click to select or drop manuscript"}
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            Supports PDF, DOC, DOCX up to 30MB
                          </p>
                        </div>
                        {selectedFile && (
                          <span className="mt-1 px-3 py-1 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg text-xs font-semibold">
                            Replace File
                          </span>
                        )}
                      </label>
                    </div>
                    {fileError && (
                      <p className="text-xs text-rose-600 font-medium">{fileError}</p>
                    )}
                  </div>

                  {/* Live Preview Before Submission */}
                  {selectedFile && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Pre-Submission Document Preview
                        </h4>
                        <span className="text-[11px] text-zinc-400">
                          Check formatting and contents before submitting
                        </span>
                      </div>
                      <DocumentPreviewer fileObj={selectedFile} />
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setActiveTab("papers")}
                      className="px-4 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !selectedFile}
                      className="px-6 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
                    >
                      {submitting ? "Uploading Manuscript..." : "Submit Paper to Editorial Admin"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}

        {/* MODAL: RESUBMIT REVISED PAPER */}
        {resubmitModalOpen && paperToResubmit && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    Round #{paperToResubmit.reviewCount} Resubmission
                  </span>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                    {paperToResubmit.title}
                  </h3>
                </div>
                <button
                  onClick={() => setResubmitModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl font-bold p-1 cursor-pointer"
                >
                  ×
                </button>
              </div>

              {/* Reviewer notes reminder */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs">
                <p className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Reviewer's Feedback:</p>
                <p className="text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {paperToResubmit.lastFeedback}
                </p>
              </div>

              <form onSubmit={handleResubmitPaper} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Upload Updated Manuscript (.pdf, .doc, .docx)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResubmitFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-900 file:text-white dark:file:bg-white dark:file:text-zinc-900 hover:file:opacity-90"
                  />
                  {resubmitFile && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                      Selected: {resubmitFile.name}
                    </p>
                  )}
                </div>

                {resubmitFile && (
                  <div className="pt-2">
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Preview of New Revision:
                    </p>
                    <DocumentPreviewer fileObj={resubmitFile} className="max-h-[350px]" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Revision Notes / Response to Reviewer *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={resubmitNotes}
                    onChange={(e) => setResubmitNotes(e.target.value)}
                    placeholder="Detail the corrections made according to the reviewer's feedback..."
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setResubmitModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resubmitting}
                    className="px-5 py-2 text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl hover:opacity-90 transition-all shadow-sm cursor-pointer"
                  >
                    {resubmitting ? "Sending Resubmission..." : "Confirm & Send to Admin"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
