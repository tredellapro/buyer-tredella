"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { gql } from "@/lib/graphql";
import { useAuth } from "@/lib/auth";

type TokenState = "checking" | "valid" | "invalid";

function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [tokenState, setTokenState] = useState<TokenState>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { adoptSession } = useAuth();
  const router = useRouter();

  /* Verify the emailed link before showing the form, so an expired link
     doesn't waste the user's time typing a new password. */
  useEffect(() => {
    if (!token) {
      setTokenState("invalid");
      return;
    }
    gql<{ verifyResetToken: boolean }>(
      `query($token: String!) { verifyResetToken(token: $token) }`,
      { token },
      { revalidate: 0 }
    )
      .then((data) => setTokenState(data.verifyResetToken ? "valid" : "invalid"))
      .catch(() => setTokenState("invalid"));
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const data = await gql<{
        resetPassword: {
          token: string;
          user: { id: string; name: string; email: string; role: string };
        };
      }>(
        `mutation($token: String!, $newPassword: String!) {
          resetPassword(token: $token, newPassword: $newPassword) {
            token
            user { id name email role }
          }
        }`,
        { token, newPassword: password }
      );
      // signed in automatically — no need to log in again
      adoptSession(data.resetPassword.token, data.resetPassword.user);
      router.push("/account");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not reset your password."
      );
      setBusy(false);
    }
  };

  const inputClass =
    "h-11 w-full rounded-md border border-line px-4 pr-12 text-sm outline-none placeholder:text-muted focus:border-primary";

  if (tokenState === "checking")
    return <p className="py-6 text-center text-sm text-muted">Checking your link…</p>;

  if (tokenState === "invalid")
    return (
      <>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-2xl">
          ⚠️
        </div>
        <h1 className="text-center text-xl font-bold text-heading">
          This link has expired
        </h1>
        <p className="mt-2 text-center text-sm text-body">
          Reset links are valid for 1 hour and can only be used once. Request a
          fresh one to continue.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 block rounded bg-primary py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Request a New Link
        </Link>
      </>
    );

  return (
    <>
      <h1 className="text-center text-xl font-bold text-heading">
        Set a new password
      </h1>
      <p className="mt-1 text-center text-sm text-muted">
        Choose a password you haven&apos;t used before
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (min 6 characters)"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted hover:text-primary"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>

        <input
          type={show ? "text" : "password"}
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          className={inputClass}
        />

        {confirm.length > 0 && confirm !== password && (
          <p className="text-xs text-primary">Passwords don&apos;t match yet.</p>
        )}
        {error && <p className="text-sm text-primary">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="h-11 w-full rounded bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {busy ? "Saving…" : "Reset Password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
        <Suspense
          fallback={
            <p className="py-6 text-center text-sm text-muted">Loading…</p>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
