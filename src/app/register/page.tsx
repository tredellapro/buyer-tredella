"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "/";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(name, email, password);
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
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
        <h1 className="text-center text-xl font-bold text-heading">
          Create your account
        </h1>
        <p className="mt-1 text-center text-sm text-muted">
          One account for retail and wholesale buying
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="h-11 w-full rounded-md border border-line px-4 text-sm outline-none placeholder:text-muted focus:border-primary"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="h-11 w-full rounded-md border border-line px-4 text-sm outline-none placeholder:text-muted focus:border-primary"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            className="h-11 w-full rounded-md border border-line px-4 text-sm outline-none placeholder:text-muted focus:border-primary"
          />
          {error && <p className="text-sm text-primary">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="h-11 w-full rounded bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {busy ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
