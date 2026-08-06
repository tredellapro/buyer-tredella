"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { gqlAuth } from "@/lib/graphql";
import { useAuth } from "@/lib/auth";
import type { ApiQuestion } from "@/lib/types";

type Props = { productId: string; initialQuestions: ApiQuestion[] };

export default function QASection({ productId, initialQuestions }: Props) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const ask = async () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (text.trim().length < 5) {
      setError("Please write a longer question.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const data = await gqlAuth<{ askProductQuestion: ApiQuestion }>(
        `mutation($productId: ID!, $text: String!) {
          askProductQuestion(productId: $productId, text: $text) {
            id text answer answeredAt createdAt user { name }
          }
        }`,
        { productId, text: text.trim() }
      );
      setQuestions([data.askProductQuestion, ...questions]);
      setText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit question.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
      <h2 className="text-lg font-bold text-heading">
        Questions About This Product
      </h2>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Enter your question here..."
          className="h-11 flex-1 rounded-md border border-line px-4 text-sm outline-none placeholder:text-muted focus:border-primary"
        />
        <button
          type="button"
          onClick={ask}
          disabled={busy}
          className="rounded bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          Ask Question
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-primary">{error}</p>}

      <div className="mt-6 space-y-5">
        {questions.length === 0 ? (
          <p className="text-sm text-muted">
            There are no questions yet. Ask the seller now and their answer will
            appear here.
          </p>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="border-b border-line pb-4 last:border-0">
              <p className="text-sm font-semibold text-heading">
                Q: {q.text}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {q.user.name} · {new Date(q.createdAt).toLocaleDateString()}
              </p>
              {q.answer ? (
                <p className="mt-2 rounded-md bg-paper px-3 py-2 text-sm text-body">
                  <span className="font-semibold text-heading">Seller: </span>
                  {q.answer}
                </p>
              ) : (
                <p className="mt-2 text-xs italic text-muted">
                  Waiting for the seller&apos;s answer…
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
