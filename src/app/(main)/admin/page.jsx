"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useToast } from "@/components/Toast";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export default function AdminPortalPage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const router = useRouter();
  const toast = useToast();

  const [papers, setPapers] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    submitted: 0,
    underReview: 0,
    revisionRequested: 0,
    resubmitted: 0,
    published: 0,
  });
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Review link generation state
  const [generatingTokenId, setGeneratingTokenId] = useState(null);
  const [generatedLinkModal, setGeneratedLinkModal] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Active tab: papers | users
  const [activeSection, setActiveSection] = useState("papers");

  // User management state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [roleChangeTarget, setRoleChangeTarget] = useState(null); // { userId, currentRole }
  const [newRole, setNewRole] = useState("");

  // Auth guard - redirect non-admins
  useEffect(() => {
    if (!isPending && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [isPending, user, router]);

  const fetchAllPapers = async () => {
    setLoading(true);
    setError("");
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== "All") queryParams.append("status", statusFilter);
      if (search.trim()) queryParams.append("search", search.trim());

      const res = await fetch(`${API_BASE}/api/papers?${queryParams.toString()}`);
      const data = await res.json();

      if (data.success) {
        setPapers(data.papers || []);
        if (data.metrics) setMetrics(data.metrics);
      } else {
        setError(data.error || "Failed to load papers.");
      }
    } catch {
      setError("Unable to connect to IntelliSubmit API Server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        toast.error(data.error || "Failed to load users.");
      }
    } catch {
      toast.error("Unable to connect to the server.");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAllPapers();
    }
  }, [statusFilter, user]);

  useEffect(() => {
    if (activeSection === "users" && user?.role === "admin") {
      fetchUsers();
    }
  }, [activeSection, user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAllPapers();
  };

  const handleGenerateReviewLink = async (paper) => {
    setGeneratingTokenId(paper._id);
    try {
      const res = await fetch(`${API_BASE}/api/papers/${paper._id}/generate-token`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        setGeneratedLinkModal({
          paper: data.paper,
          reviewUrl: data.reviewUrl,
        });
        setPapers((prev) =>
          prev.map((p) => (p._id === paper._id ? data.paper : p))
        );
        toast.success("Review link generated successfully.");
      } else {
        toast.error(data.error || "Failed to generate review link.");
      }
    } catch {
      toast.error("Network error generating review link.");
    } finally {
      setGeneratingTokenId(null);
    }
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleChangeUserRole = async () => {
    if (!roleChangeTarget || !newRole) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${roleChangeTarget.userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`User role updated to ${newRole}.`);
        setRoleChangeTarget(null);
        setNewRole("");
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to update user role.");
      }
    } catch {
      toast.error("Network error updating user role.");
    }
  };

  const createMailtoLink = (paper, reviewUrl) => {
    const subject = encodeURIComponent(`Peer Review Request: "${paper.title}"`);
    const body = encodeURIComponent(
      `Dear Reviewer,\n\nYou have been invited to review the manuscript entitled "${paper.title}" submitted to IntelliSubmit.\n\nPlease review the paper and submit your recommendation via the secure link below:\n${reviewUrl}\n\nAbstract:\n${paper.abstract}\n\nThank you for your valuable contribution to the peer review process.\n\nBest regards,\nEditorial Office`
    );
    return `mailto:?subject=${subject}&body=${body}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Submitted":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            New Submission
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
            Resubmitted (Action Required)
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

  // Auth guard loading state
  if (isPending || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-3 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100 rounded-full animate-spin" />
          <p className="text-xs text-zinc-500">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                Editorial Admin
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Manuscript management & reviewer dispatch portal
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-2">
              Submission Oversight & Dispatch
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection("papers")}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                activeSection === "papers"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              Papers
            </button>
            <button
              onClick={() => setActiveSection("users")}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                activeSection === "users"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              User Management
            </button>
            <button
              onClick={fetchAllPapers}
              className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* ========== PAPERS SECTION ========== */}
        {activeSection === "papers" && (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
                <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Total Papers</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{metrics.total}</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 shadow-xs">
                <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">New Submissions</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{metrics.submitted}</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 shadow-xs">
                <p className="text-[11px] font-medium text-blue-700 dark:text-blue-400">Under Review</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{metrics.underReview}</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/50 rounded-xl p-4 shadow-xs">
                <p className="text-[11px] font-medium text-rose-700 dark:text-rose-400">Revision Req.</p>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{metrics.revisionRequested}</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-900/50 rounded-xl p-4 shadow-xs">
                <p className="text-[11px] font-medium text-purple-700 dark:text-purple-400">Resubmitted</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{metrics.resubmitted}</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-4 shadow-xs">
                <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Published</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{metrics.published}</p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {["All", "Submitted", "Resubmitted", "Under Review", "Revision Requested", "Published"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      statusFilter === status
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, author, category..."
                  className="w-full sm:w-64 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-zinc-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Papers List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  <div className="w-8 h-8 mx-auto border-3 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100 rounded-full animate-spin" />
                  <p className="text-xs text-zinc-500 mt-3">Loading papers...</p>
                </div>
              ) : papers.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 space-y-2">
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No papers found</p>
                  <p className="text-xs text-zinc-400">Try adjusting your status filter or search query.</p>
                </div>
              ) : (
                papers.map((paper) => {
                  const clientUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
                  const existingReviewUrl = paper.reviewToken ? `${clientUrl}/review/${paper.reviewToken}` : null;

                  return (
                    <div
                      key={paper._id}
                      className={`bg-white dark:bg-zinc-900 border rounded-2xl p-6 shadow-xs space-y-4 transition-all ${
                        paper.status === "Resubmitted"
                          ? "border-purple-300 dark:border-purple-900/60 ring-1 ring-purple-100 dark:ring-purple-950/40"
                          : paper.status === "Submitted"
                          ? "border-amber-200 dark:border-amber-900/40"
                          : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        {/* Left: Metadata */}
                        <div className="space-y-2 max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2">
                            {getStatusBadge(paper.status)}
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                              {paper.category}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                              Review Round: {paper.reviewCount || 0}
                            </span>
                            <span className="text-xs text-zinc-400">
                              Updated: {new Date(paper.updatedAt || paper.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                            {paper.title}
                          </h3>

                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            <strong className="text-zinc-700 dark:text-zinc-300">Author:</strong> {paper.authorName} ({paper.authorEmail})
                            {paper.authors && ` • Authors: ${Array.isArray(paper.authors) ? paper.authors.join(", ") : paper.authors}`}
                          </p>

                          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {paper.abstract}
                          </p>

                          {/* Resubmission alert */}
                          {paper.status === "Resubmitted" && (
                            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 rounded-xl text-xs text-purple-900 dark:text-purple-200 space-y-1">
                              <p className="font-bold flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-purple-600" />
                                Author Resubmission Notes:
                              </p>
                              <p className="whitespace-pre-wrap">{paper.latestRevisionNotes || "Revised manuscript uploaded."}</p>
                            </div>
                          )}

                          {/* Existing Review URL bar if already generated */}
                          {existingReviewUrl && (
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-[11px]">
                                  Active Review URL:
                                </span>
                                <span className="text-[10px] text-zinc-400">
                                  Direct Reviewer Link (No Login Needed)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  readOnly
                                  value={existingReviewUrl}
                                  className="w-full px-2.5 py-1 text-[11px] font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300"
                                />
                                <button
                                  onClick={() => handleCopyLink(existingReviewUrl)}
                                  className="px-2.5 py-1 text-[11px] font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg hover:opacity-90 shrink-0 cursor-pointer"
                                >
                                  Copy
                                </button>
                                <a
                                  href={createMailtoLink(paper, existingReviewUrl)}
                                  className="px-2.5 py-1 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shrink-0 transition-colors"
                                >
                                  Email
                                </a>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right: Actions — No document preview for admin */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                          {/* Generate / Regenerate Review URL Action */}
                          <button
                            onClick={() => handleGenerateReviewLink(paper)}
                            disabled={generatingTokenId === paper._id}
                            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
                              paper.status === "Submitted" || paper.status === "Resubmitted"
                                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90"
                                : "bg-white text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/60"
                            }`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            {generatingTokenId === paper._id
                              ? "Generating..."
                              : existingReviewUrl
                              ? "Regenerate Link"
                              : "Generate Review URL"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ========== USER MANAGEMENT SECTION ========== */}
        {activeSection === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Registered Users ({users.length})
              </h2>
              <button
                onClick={fetchUsers}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium cursor-pointer"
              >
                Refresh
              </button>
            </div>

            {usersLoading ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <div className="w-8 h-8 mx-auto border-3 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100 rounded-full animate-spin" />
                <p className="text-xs text-zinc-500 mt-3">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8">
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No users found</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
                        <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">Email</th>
                        <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">Current Role</th>
                        <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {users.map((u) => (
                        <tr key={u.id || u._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{u.name}</td>
                          <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400"
                                : u.role === "reviewer"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                            }`}>
                              {u.role || "author"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setRoleChangeTarget({ userId: u._id || u.id, currentRole: u.role || "author" });
                                setNewRole(u.role === "author" ? "reviewer" : u.role === "reviewer" ? "admin" : "author");
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                            >
                              Change Role
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODAL: GENERATED REVIEW LINK DIALOG */}
        {generatedLinkModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Review URL Ready
                  </span>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-1.5">
                    Send Manuscript to Reviewer
                  </h3>
                </div>
                <button
                  onClick={() => setGeneratedLinkModal(null)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl font-bold cursor-pointer"
                >
                  ×
                </button>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                A unique, secure review link has been generated for <strong>"{generatedLinkModal.paper.title}"</strong>. The reviewer does not need an account and can directly access the document and review form.
              </p>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Unique Reviewer Access URL:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLinkModal.reviewUrl}
                    className="w-full px-3 py-2 text-xs font-mono bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white"
                  />
                  <button
                    onClick={() => handleCopyLink(generatedLinkModal.reviewUrl)}
                    className="px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-xs font-bold hover:opacity-90 shrink-0 cursor-pointer"
                  >
                    {copiedLink ? "Copied!" : "Copy URL"}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    Manual Mail to Reviewer:
                  </span>
                  <a
                    href={createMailtoLink(generatedLinkModal.paper, generatedLinkModal.reviewUrl)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Open Mail Client
                  </a>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Clicking "Open Mail Client" will compose an email in your default client with subject, paper title, and review link pre-populated.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setGeneratedLinkModal(null)}
                  className="px-4 py-2 text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ROLE CHANGE DIALOG */}
        {roleChangeTarget && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Change User Role</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Current role: <strong className="text-zinc-900 dark:text-white">{roleChangeTarget.currentRole}</strong>
              </p>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  New Role:
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                >
                  <option value="author">Author</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setRoleChangeTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangeUserRole}
                  className="px-4 py-2 text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl hover:opacity-90 transition-all shadow-xs cursor-pointer"
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
