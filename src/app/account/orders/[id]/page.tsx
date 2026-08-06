"use client";

import { useCallback, useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { HiStar, HiOutlineStar, HiOutlinePhoto, HiXMark } from "react-icons/hi2";
import { formatAED } from "@/data/products";
import { gqlAuth, uploadReviewImages } from "@/lib/graphql";
import { useAuth } from "@/lib/auth";
import type { ApiOrder } from "@/lib/types";

const MAX_REVIEW_PHOTOS = 5;

type Props = { params: Promise<{ id: string }> };

export default function OrderDetailPage({ params }: Props) {
  const { id } = use(params);
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [reviewFor, setReviewFor] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const placed = useSearchParams().get("placed");

  const load = useCallback(() => {
    gqlAuth<{ getOrder: ApiOrder | null }>(
      `query($id: ID!) {
        getOrder(id: $id) {
          id mode status total createdAt
          sellerOrders {
            id status subtotal
            seller { name slug }
            items {
              id name image quantity unitPrice total reviewable
              product { slug }
            }
          }
        }
      }`,
      { id }
    ).then((data) => setOrder(data.getOrder));
  }, [id]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const submitReview = async (orderItemId: string) => {
    setSubmitting(true);
    try {
      // upload photos first so the review is saved with their URLs
      const images = photos.length > 0 ? await uploadReviewImages(photos) : [];
      await gqlAuth(
        `mutation($orderItemId: ID!, $rating: Int!, $text: String!, $images: [String!]) {
          createReview(orderItemId: $orderItemId, rating: $rating, text: $text, images: $images) { id }
        }`,
        { orderItemId, rating, text, images }
      );
      toast.success("Review submitted — thank you!");
      setReviewFor(null);
      setText("");
      setPhotos([]);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    setPhotos((prev) =>
      [...prev, ...Array.from(files)].slice(0, MAX_REVIEW_PHOTOS)
    );
  };

  if (!order)
    return (
      <div className="rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
        <p className="text-sm text-muted">Loading order…</p>
      </div>
    );

  return (
    <div className="space-y-5">
      {placed && (
        <div className="rounded-lg bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
          ✓ Your order has been placed successfully!
        </div>
      )}

      <div className="rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-heading">
              Order #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="mt-1 text-xs text-muted">
              {new Date(order.createdAt).toLocaleString()} · {order.mode}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">
              {formatAED(order.total)}
            </p>
            <p className="text-xs font-semibold text-body">{order.status}</p>
          </div>
        </div>
      </div>

      {order.sellerOrders.map((so) => (
        <div
          key={so.id}
          className="rounded-lg bg-white shadow-[0_1px_3px_rgba(43,52,69,0.1)]"
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <Link
              href={`/seller/${so.seller.slug}`}
              className="text-sm font-semibold text-heading hover:text-primary"
            >
              {so.seller.name}
            </Link>
            <span className="text-xs font-medium text-body">{so.status}</span>
          </div>

          {so.items.map((item) => (
            <div key={item.id} className="border-b border-line px-5 py-4 last:border-0">
              <div className="flex items-center gap-4">
                <Link
                  href={`/product/${item.product.slug}`}
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-paper p-2"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={56}
                    height={56}
                    className="h-full w-full object-contain"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-heading">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted">
                    {item.quantity} × {formatAED(item.unitPrice)}
                  </p>
                </div>
                <span className="text-sm font-bold text-primary">
                  {formatAED(item.total)}
                </span>
                {item.reviewable && (
                  <button
                    type="button"
                    onClick={() => setReviewFor(reviewFor === item.id ? null : item.id)}
                    className="rounded border border-primary px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white"
                  >
                    Write Review
                  </button>
                )}
              </div>

              {reviewFor === item.id && (
                <div className="mt-3 rounded-md bg-paper p-4">
                  <p className="text-xs font-semibold text-heading">
                    How would you rate it?
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      >
                        {star <= rating ? (
                          <HiStar size={26} className="text-amber-400" />
                        ) : (
                          <HiOutlineStar size={26} className="text-line" />
                        )}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Share your experience with this product…"
                    rows={3}
                    className="mt-3 w-full rounded-md border border-line p-3 text-sm outline-none placeholder:text-muted focus:border-primary"
                  />

                  {/* Photo upload */}
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {photos.map((file, i) => (
                        <div
                          key={`${file.name}-${i}`}
                          className="relative h-20 w-20 overflow-hidden rounded-md border border-line"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Selected photo ${i + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            aria-label="Remove photo"
                            onClick={() =>
                              setPhotos((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              )
                            }
                            className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-heading/70 text-white hover:bg-primary"
                          >
                            <HiXMark size={12} />
                          </button>
                        </div>
                      ))}

                      {photos.length < MAX_REVIEW_PHOTOS && (
                        <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-line bg-white text-muted hover:border-primary hover:text-primary">
                          <HiOutlinePhoto size={20} />
                          <span className="text-[10px] font-medium">
                            Add photo
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              addPhotos(e.target.files);
                              e.target.value = "";
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-muted">
                      Add up to {MAX_REVIEW_PHOTOS} photos (max 5 MB each) —
                      shoppers find photo reviews far more useful.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => submitReview(item.id)}
                    disabled={submitting}
                    className="mt-3 rounded bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
                  >
                    {submitting ? "Submitting…" : "Submit Review"}
                  </button>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end px-5 py-3 text-sm text-muted">
            Subtotal:{" "}
            <span className="ml-1 font-bold text-heading">
              {formatAED(so.subtotal)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
