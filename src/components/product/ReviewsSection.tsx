"use client";

import { useState } from "react";
import Image from "next/image";
import { HiStar, HiOutlineStar, HiXMark, HiOutlineCheckBadge } from "react-icons/hi2";
import type { ApiReview } from "@/lib/types";

type Props = {
  reviews: ApiReview[];
  average: number;
  total: number;
  /** Count of 1★…5★ */
  distribution: number[];
};

const Stars = ({ rating, size = 15 }: { rating: number; size?: number }) => (
  <span className="inline-flex items-center gap-0.5 align-middle">
    {[1, 2, 3, 4, 5].map((i) =>
      i <= Math.round(rating) ? (
        <HiStar key={i} size={size} className="text-amber-400" />
      ) : (
        <HiOutlineStar key={i} size={size} className="text-line" />
      )
    )}
  </span>
);

export default function ReviewsSection({
  reviews,
  average,
  total,
  distribution,
}: Props) {
  const [filter, setFilter] = useState<number | "all" | "photos">("all");
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(
    null
  );

  const allPhotos = reviews.flatMap((r) => r.images);

  const visible = reviews.filter((r) => {
    if (filter === "all") return true;
    if (filter === "photos") return r.images.length > 0;
    return r.rating === filter;
  });

  const showPrev = () =>
    setLightbox((lb) =>
      lb ? { ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length } : lb
    );
  const showNext = () =>
    setLightbox((lb) =>
      lb ? { ...lb, index: (lb.index + 1) % lb.images.length } : lb
    );

  return (
    <section className="rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
      <h2 className="text-lg font-bold text-heading">Ratings &amp; Reviews</h2>

      {total === 0 ? (
        <p className="mt-3 text-sm text-muted">
          No reviews yet. Reviews can be written from your orders once delivery
          is completed.
        </p>
      ) : (
        <>
          {/* Summary: score + bars */}
          <div className="mt-4 flex flex-col gap-6 border-b border-line pb-5 sm:flex-row sm:items-center">
            <div className="text-center sm:w-40 sm:shrink-0">
              <p className="text-4xl font-bold text-heading">
                {average.toFixed(1)}
                <span className="text-lg font-normal text-muted">/5</span>
              </p>
              <Stars rating={average} size={18} />
              <p className="mt-1 text-xs text-muted">{total} ratings</p>
            </div>

            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = distribution[star - 1] ?? 0;
                const pct = total ? (count / total) * 100 : 0;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFilter(filter === star ? "all" : star)}
                    className="flex w-full items-center gap-2 text-xs"
                  >
                    <span className="flex w-10 shrink-0 items-center gap-0.5 text-muted">
                      {star} <HiStar size={12} className="text-amber-400" />
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-paper">
                      <span
                        className="block h-full rounded-full bg-amber-400"
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    <span className="w-8 text-right text-muted">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo strip from all reviews */}
          {allPhotos.length > 0 && (
            <div className="border-b border-line py-4">
              <p className="mb-2 text-sm font-semibold text-heading">
                Photos from reviewers ({allPhotos.length})
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allPhotos.slice(0, 12).map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setLightbox({ images: allPhotos, index: i })}
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-line hover:border-primary"
                  >
                    <Image
                      src={src}
                      alt={`Customer photo ${i + 1}`}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2 py-4">
            {[
              { key: "all" as const, label: `All (${total})` },
              {
                key: "photos" as const,
                label: `With photos (${reviews.filter((r) => r.images.length > 0).length})`,
              },
            ].map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => setFilter(chip.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  filter === chip.key
                    ? "bg-primary text-white"
                    : "bg-paper text-body hover:text-primary"
                }`}
              >
                {chip.label}
              </button>
            ))}
            {filter !== "all" && typeof filter === "number" && (
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-white"
              >
                {filter} ★ · clear
              </button>
            )}
          </div>

          {/* Review list */}
          <div className="space-y-5">
            {visible.length === 0 ? (
              <p className="text-sm text-muted">
                No reviews match this filter.
              </p>
            ) : (
              visible.map((review) => (
                <article
                  key={review.id}
                  className="border-b border-line pb-5 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
                      {review.user.name.charAt(0)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-heading">
                          {review.user.name}
                        </span>
                        {review.verified && (
                          <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                            <HiOutlineCheckBadge size={12} />
                            Verified Purchase
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <Stars rating={review.rating} size={14} />
                        <span className="text-xs text-muted">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-AE",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-relaxed text-body">
                        {review.text}
                      </p>

                      {review.images.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {review.images.map((src, i) => (
                            <button
                              key={`${src}-${i}`}
                              type="button"
                              onClick={() =>
                                setLightbox({ images: review.images, index: i })
                              }
                              className="h-20 w-20 overflow-hidden rounded-md border border-line hover:border-primary"
                            >
                              <Image
                                src={src}
                                alt={`Photo ${i + 1} by ${review.user.name}`}
                                width={80}
                                height={80}
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </>
      )}

      {/* Photo lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-heading/80 p-4"
          onClick={() => setLightbox(null)}
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close photo"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            <HiXMark size={22} />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-full w-full max-w-2xl flex-col items-center gap-3"
          >
            <Image
              src={lightbox.images[lightbox.index]}
              alt={`Customer photo ${lightbox.index + 1}`}
              width={800}
              height={800}
              className="max-h-[70vh] w-auto rounded-lg object-contain"
            />
            {lightbox.images.length > 1 && (
              <div className="flex items-center gap-4 text-sm text-white">
                <button
                  type="button"
                  onClick={showPrev}
                  className="rounded-full bg-white/15 px-4 py-1.5 hover:bg-white/25"
                >
                  Prev
                </button>
                <span>
                  {lightbox.index + 1} / {lightbox.images.length}
                </span>
                <button
                  type="button"
                  onClick={showNext}
                  className="rounded-full bg-white/15 px-4 py-1.5 hover:bg-white/25"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
