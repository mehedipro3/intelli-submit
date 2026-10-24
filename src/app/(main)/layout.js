"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const isDashboard = Boolean(
    pathname?.startsWith("/author") ||
    pathname?.startsWith("/reviewer") ||
    pathname?.startsWith("/admin")
  );

  if (!isDashboard) {
    return children;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 lg:pl-0">
        {children}
      </main>
    </div>
  );
}
