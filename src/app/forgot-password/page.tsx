"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { gql } from "@/lib/graphql";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await gql<{ requestPasswordReset: { ok: boolean } }>(
        `mutation($email: String!) {
          requestPasswordReset(email: $email) { ok emailSent }
        }`,
        { email: email.trim() }
      );
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not send the reset email. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center bg-paper px-4 py-16">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
        <Link href="/" className="mb-6 block">
          <Image
            src="/assets/images/logo.png"
            alt="Tredella"
            width={140}
            height={40}
            className="mx-auto h-9 w-auto"
          />
        </Link>

        {sent ? (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
              ✉️
            </div>
            <h1 className="text-center text-xl font-bold text-heading">
              Check your email
            </h1>
            <p className="mt-2 text-center text-sm text-body">
              If an account exists for{" "}
              <span className="font-semibold text-heading">{email}</span>,
              we&apos;ve sent a link to reset your password. The link expires in
              1 hour.
            </p>
            <p className="mt-4 text-center text-xs text-muted">
              Didn&apos;t get it? Check your spam folder, or{" "}
              <button
                type="button"
                onClick={() => setSent(false)}
                className="font-semibold text-primary hover:underline"
              >
                try another email
              </button>
              .
            </p>
            <Link
              href="/login"
              className="mt-6 block rounded bg-primary py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Back to Sign In
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-center text-xl font-bold text-heading">
              Forgot your password?
            </h1>
            <p className="mt-1 text-center text-sm text-muted">
              Enter your email and we&apos;ll send you a reset link
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="h-11 w-full rounded-md border border-line px-4 text-sm outline-none placeholder:text-muted focus:border-primary"
              />
              {error && <p className="text-sm text-primary">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="h-11 w-full rounded bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
              >
                {busy ? "Sending…" : "Send Reset Link"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-muted">
              Remembered it?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
