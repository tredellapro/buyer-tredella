"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";

/* Landing point for the OAuth redirect: stores the session the API issued,
   then continues to wherever the user was headed. */
function AuthCallback() {
  const params = useSearchParams();
  const router = useRouter();
  const { adoptSession } = useAuth();

  useEffect(() => {
    const token = params.get("token");
    const rawUser = params.get("user");
    const next = params.get("next") || "/";

    if (!token || !rawUser) {
      router.replace("/login?error=Sign-in%20failed.%20Please%20try%20again.");
      return;
    }
    try {
      adoptSession(token, JSON.parse(rawUser));
      router.replace(next);
    } catch {
      router.replace("/login?error=Sign-in%20failed.%20Please%20try%20again.");
    }
  }, [params, router, adoptSession]);

  return (
    <p className="py-20 text-center text-sm text-muted">Signing you in…</p>
  );
}

export default function AuthCallbackPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-paper">
      <Suspense
        fallback={
          <p className="py-20 text-center text-sm text-muted">Signing you in…</p>
        }
      >
        <AuthCallback />
      </Suspense>
    </main>
  );
}
