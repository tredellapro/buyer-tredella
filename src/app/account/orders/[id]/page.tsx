"use client";

import { useCallback, useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatAED } from "@/data/products";
import { gqlAuth } from "@/lib/graphql";
import { useAuth } from "@/lib/auth";
import type { ApiOrder } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default function OrderDetailPage({ params }: Props) {
  const { id } = use(params);
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [reviewFor, setReviewFor] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
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
    setMessage(null);
    try {
      await gqlAuth(
        `mutation($orderItemId: ID!, $rating: Int!, $text: String!) {
          createReview(orderItemId: $orderItemId, rating: $rating, text: $text) { id }
        }`,
        { orderItemId, rating, text }
      );
      setMessage("Review submitted — thank you!");
      setReviewFor(null);
      setText("");
      load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not submit review.");
    }
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
      {message && (
        <div className="rounded-lg bg-primary-light px-5 py-3 text-sm font-medium text-primary">
          {message}
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
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-xl"
                        aria-label={`${star} stars`}
                      >
                        <span className={star <= rating ? "text-amber-400" : "text-line"}>
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Share your experience with this product…"
                    rows={3}
                    className="mt-2 w-full rounded-md border border-line p-3 text-sm outline-none placeholder:text-muted focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => submitReview(item.id)}
                    className="mt-2 rounded bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                  >
                    Submit Review
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
