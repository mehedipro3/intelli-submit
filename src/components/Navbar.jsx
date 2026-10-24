"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bars, Moon, Sun, Magnet, ArrowRightFromSquare, Person, ShieldCheck } from "@gravity-ui/icons";
import { useSession, signOut } from "@/lib/auth-client";

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isDashboard =
    pathname.startsWith("/author") ||
    pathname.startsWith("/reviewer") ||
    pathname.startsWith("/admin");

  if (isDashboard) {
    return null;
  }

  // Sync theme state with DOM / localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    router.push("/login");
  };

  const user = session?.user;
  const userRole = user?.role || "author";

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getDashboardHref = () => {
    if (userRole === "admin") return "/admin";
    if (userRole === "reviewer") return "/reviewer";
    return "/author";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 text-black dark:text-white group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white shadow-sm transition-transform group-hover:scale-105 dark:bg-white dark:text-black">
              <Magnet className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              IntelliSubmit
            </span>
          </Link>
        </div>

        {/* Center: Nav links (Desktop) — only show public links + role-appropriate dashboard */}
        <nav className="hidden md:flex items-center gap-6">
          {user && (
            <Link href={getDashboardHref()} className="text-sm font-semibold text-zinc-800 transition-colors hover:text-black dark:text-zinc-200 dark:hover:text-white flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${
                userRole === "admin" ? "bg-purple-600 dark:bg-purple-400" :
                userRole === "reviewer" ? "bg-emerald-600 dark:bg-emerald-400" :
                "bg-blue-600 dark:bg-blue-400"
              }`} />
              My Dashboard
            </Link>
          )}
          <Link href="/#features" className="text-sm font-medium text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-sm font-medium text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white">
            How It Works
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Functional Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-zinc-700 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            aria-label="Toggle theme"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
            )}
          </button>

          {/* Auth Section */}
          {isPending ? (
            <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-zinc-800 animate-pulse" />
          ) : user ? (
            /* Logged In: User Avatar + Dropdown */
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                {/* Avatar */}
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {getInitials(user.name)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white leading-tight max-w-[120px] truncate">
                      {user.name}
                    </p>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {userRole}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight max-w-[120px] truncate">
                    {user.email}
                  </p>
                </div>
                <svg className="h-3.5 w-3.5 text-zinc-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden z-50">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {getInitials(user.name)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{user.name}</p>
                          <span className="text-[9px] uppercase font-bold px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                            {userRole}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  {/* Menu items — only show role-appropriate dashboard */}
                  <div className="p-1.5">
                    <Link
                      href={getDashboardHref()}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors font-medium"
                    >
                      <Person className="h-4 w-4 text-blue-500" />
                      My Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    >
                      <ArrowRightFromSquare className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out: Login + Register buttons */
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex text-sm font-semibold text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white px-3 py-2 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            <Bars className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Click-outside overlay for user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}

      {/* Mobile Nav Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950 flex flex-col gap-3">
          {user && (
            <Link href={getDashboardHref()} onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-zinc-900 dark:text-white py-1 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                userRole === "admin" ? "bg-purple-600" :
                userRole === "reviewer" ? "bg-emerald-600" :
                "bg-blue-600"
              }`} />
              My Dashboard
            </Link>
          )}
          <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-600 dark:text-zinc-400 py-1">
            Features
          </Link>
          <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-600 dark:text-zinc-400 py-1">
            How It Works
          </Link>
          <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 py-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.email} • {userRole}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-center text-sm font-semibold text-red-600 dark:text-red-400 py-2 border border-red-200 rounded-lg dark:border-red-900/50 cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-sm font-semibold text-zinc-700 dark:text-zinc-300 py-2 border border-gray-200 rounded-lg dark:border-zinc-800"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-sm font-semibold text-white bg-black dark:bg-white dark:text-black py-2 rounded-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
