"use client";

import { useEffect, useState } from "react";
import { API_ORIGIN } from "@/lib/graphql";

/* Google / Facebook sign-in. The OAuth dance happens on the API (the client
   secret never reaches the browser), so these are plain links, not scripts.
   Providers without credentials are hidden rather than shown broken. */

type Providers = { google: boolean; facebook: boolean };

export default function SocialAuth({ next = "/" }: { next?: string }) {
  const [providers, setProviders] = useState<Providers | null>(null);

  useEffect(() => {
    fetch(`${API_ORIGIN}/auth/providers`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setProviders(data))
      .catch(() => setProviders({ google: false, facebook: false }));
  }, []);

  if (!providers || (!providers.google && !providers.facebook)) return null;

  const href = (provider: string) =>
    `${API_ORIGIN}/auth/${provider}?next=${encodeURIComponent(next)}`;

  return (
    <>
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs text-muted">or continue with</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="space-y-3">
        {providers.google && (
          <a
            href={href("google")}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-md border border-line text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"
              />
            </svg>
            Continue with Google
          </a>
        )}

        {providers.facebook && (
          <a
            href={href("facebook")}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-md border border-line text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden>
              <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12Z" />
            </svg>
            Continue with Facebook
          </a>
        )}
      </div>
    </>
  );
}
