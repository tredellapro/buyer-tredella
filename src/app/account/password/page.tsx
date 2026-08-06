"use client";

import { useState } from "react";
import { gqlAuth } from "@/lib/graphql";

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      setError("The two new passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await gqlAuth(
        `mutation($currentPassword: String!, $newPassword: String!) {
          changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
        }`,
        { currentPassword: current, newPassword: next }
      );
      setDone(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not change your password."
      );
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "h-11 w-full rounded-md border border-line px-4 pr-12 text-sm outline-none placeholder:text-muted focus:border-primary";

  return (
    <div className="rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
      <h1 className="text-xl font-bold text-heading">Change Password</h1>
      <p className="mt-1 text-sm text-muted">
        Choose a password you haven&apos;t used before.
      </p>

      {done && (
        <p className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          ✓ Your password has been updated.
        </p>
      )}

      <form onSubmit={submit} className="mt-5 max-w-sm space-y-4">
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="Current password"
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
          value={next}
          onChange={(e) => setNext(e.target.value)}
          placeholder="New password (min 6 characters)"
          className={inputClass}
        />

        <input
          type={show ? "text" : "password"}
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          className={inputClass}
        />

        {confirm.length > 0 && confirm !== next && (
          <p className="text-xs text-primary">Passwords don&apos;t match yet.</p>
        )}
        {error && <p className="text-sm text-primary">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="h-11 w-full rounded bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {busy ? "Saving…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}
