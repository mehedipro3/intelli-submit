"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Thunderbolt, 
  FileText, 
  MagicWand, 
  Check, 
  StarFill, 
  ShieldCheck, 
  Rocket, 
  CloudArrowUpIn,
  Cpu
} from "@gravity-ui/icons";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-grid-pattern selection:bg-purple-100 dark:selection:bg-purple-900 flex flex-col">

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center">
        
        {/* HERO SECTION */}
        <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl w-full text-center flex flex-col items-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100/90 dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/80 mb-8 transition-transform hover:scale-105 cursor-pointer shadow-xs">
            <Thunderbolt className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              AI-Powered Research Platform
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-4xl leading-[1.1]">
            AI-Powered <span className="bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400 bg-clip-text text-transparent">Journal</span> <br className="hidden sm:inline" />
            Submission <span className="text-zinc-900 dark:text-white">Platform</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl font-normal leading-relaxed">
            Upload your research paper and let AI automatically extract title, abstract, authors, and keywords. Streamline your publication workflow.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-black px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-7 py-3.5 text-base font-semibold text-zinc-800 dark:text-zinc-200 shadow-xs hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
            >
              Submit Paper
            </Link>
          </div>

          {/* Dashboard Preview Box matching screenshot */}
          <div className="mt-14 w-full max-w-5xl rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 shadow-2xl backdrop-blur-xl p-4 sm:p-6 overflow-hidden text-left">
            {/* Window bar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400 inline-block" />
                <span className="h-3 w-3 rounded-full bg-yellow-400 inline-block" />
                <span className="h-3 w-3 rounded-full bg-green-400 inline-block" />
                <span className="ml-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Dashboard
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </div>
            </div>

            {/* Dashboard Mock Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <CloudArrowUpIn className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">Instant Extraction</h3>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">PDF metadata parsed in seconds with 99.4% precision.</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <MagicWand className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">Smart Match</h3>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Auto-suggest best matching IEEE & Springer journals.</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">Plagiarism Guard</h3>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Built-in check before final journal submission.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl w-full border-t border-gray-100 dark:border-zinc-800">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
              Powerful Features for Academic Publishing
            </h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
              Everything researchers, journal editors, and authors need to fast-track publication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-lg transition-all">
              <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-5">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                Automated Metadata Extraction
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Upload your LaTeX or PDF file and watch AI instantly recognize author affiliations, abstracts, references, and key metrics.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-lg transition-all">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mb-5">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                Format Compliance Check
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Ensure your manuscript complies with specific journal guidelines before submitting, preventing immediate desk rejections.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-lg transition-all">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-5">
                <Rocket className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                One-Click Submission
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Submit seamlessly across leading academic indexing platforms and track your review status in real-time.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl w-full border-t border-gray-100 dark:border-zinc-800">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
              How IntelliSubmit Works
            </h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
              Three simple steps to publish your research faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xl flex items-center justify-center mb-4 shadow-md">
                1
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-lg mb-2">Upload Manuscript</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Drag & drop your research paper in PDF or Word format.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xl flex items-center justify-center mb-4 shadow-md">
                2
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-lg mb-2">AI Processing</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Our engine parses structure, metadata, and generates formatted submissions.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xl flex items-center justify-center mb-4 shadow-md">
                3
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-lg mb-2">Review & Submit</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Verify extracted details and submit directly to target journals.</p>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} IntelliSubmit AI Platform. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
