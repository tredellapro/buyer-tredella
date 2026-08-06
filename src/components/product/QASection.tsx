"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineQuestionMarkCircle,
  HiOutlineBuildingStorefront,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { gqlAuth } from "@/lib/graphql";
import { useAuth } from "@/lib/auth";
import type { ApiQuestion } from "@/lib/types";

type Props = {
  productId: string;
  initialQuestions: ApiQuestion[];
  sellerName?: string;
};

const timeAgo = (date: string) => {
  const days = Math.floor(
    (Date.now() - new Date(date).getTime()) / 86_400_000
  );
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
};

export default function QASection({
  productId,
  initialQuestions,
  sellerName = "Seller",
}: Props) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const answered = questions.filter((q) => q.answer).length;
  const visible = showAll ? questions : questions.slice(0, 4);

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
      toast.success("Question sent to the seller");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit question.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold text-heading">
          <HiOutlineChatBubbleLeftRight size={20} className="text-primary" />
          Questions about this product
        </h2>
        {questions.length > 0 && (
          <span className="text-xs text-muted">
            {questions.length} asked · {answered} answered
          </span>
        )}
      </div>

      {/* Ask box */}
      <div className="mt-4 rounded-lg bg-paper p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder="Ask the seller anything about this product…"
            className="h-11 flex-1 rounded-md border border-line bg-white px-4 text-sm outline-none placeholder:text-muted focus:border-primary"
          />
          <button
            type="button"
            onClick={ask}
            disabled={busy}
            className="h-11 shrink-0 rounded bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {busy ? "Sending…" : "Ask Question"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-primary">{error}</p>}
        <p className="mt-2 text-xs text-muted">
          Usually answered within 24 hours. Please don&apos;t share personal
          contact details.
        </p>
      </div>

      {/* Thread */}
      <div className="mt-5">
        {questions.length === 0 ? (
          <div className="py-8 text-center">
            <HiOutlineQuestionMarkCircle
              size={40}
              className="mx-auto text-line"
            />
            <p className="mt-2 text-sm text-muted">
              There are no questions yet. Ask the seller now and their answer
              will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map((q) => (
              <div
                key={q.id}
                className="border-b border-line pb-4 last:border-0"
              >
                {/* Question */}
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-heading text-[11px] font-bold text-white">
                    Q
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-heading">{q.text}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {q.user.name} · {timeAgo(q.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Seller answer, indented under its question */}
                {q.answer ? (
                  <div className="mt-3 ml-10 flex items-start gap-3 rounded-lg bg-paper p-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                      A
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <HiOutlineBuildingStorefront size={13} />
                        {sellerName}
                        <span className="font-normal text-muted">· Seller</span>
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-body">
                        {q.answer}
                      </p>
                      {q.answeredAt && (
                        <p className="mt-1 text-xs text-muted">
                          {timeAgo(q.answeredAt)}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 ml-10 text-xs italic text-muted">
                    Waiting for the seller&apos;s answer…
                  </p>
                )}
              </div>
            ))}

            {questions.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                {showAll
                  ? "Show fewer questions"
                  : `Show all ${questions.length} questions`}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
