"use client";

import Link from "next/link";

/* Shown when a server component throws — most often because the GraphQL API
   is unreachable (backend not running locally, or NEXT_PUBLIC_GRAPHQL_URL not
   set on the deployment). */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 items-center justify-center bg-paper px-4 py-20">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-2xl">
          ⚠️
        </div>
        <h1 className="text-xl font-bold text-heading">
          We couldn&apos;t load this page
        </h1>
        <p className="mt-2 text-sm text-body">
          The store couldn&apos;t reach our servers. This is usually temporary —
          please try again in a moment.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="flex-1 rounded bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 rounded border border-line py-3 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
          >
            Go Home
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <p className="mt-5 break-words rounded-md bg-paper p-3 text-left text-xs text-muted">
            {error.message}
          </p>
        )}
      </div>
    </main>
  );
}
