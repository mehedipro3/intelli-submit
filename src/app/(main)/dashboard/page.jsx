"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function DashboardRedirect() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        router.replace("/login");
      } else {
        const role = session.user.role || "author";
        if (role === "admin") router.replace("/admin");
        else if (role === "reviewer") router.replace("/reviewer");
        else router.replace("/author");
      }
    }
  }, [session, isPending, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-white dark:border-t-transparent" />
    </div>
  );
}
