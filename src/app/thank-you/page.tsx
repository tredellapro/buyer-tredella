"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import { formatAED } from "@/data/products";
import { gqlAuth } from "@/lib/graphql";
import { useAuth } from "@/lib/auth";
import type { ApiOrder } from "@/lib/types";

function ThankYou() {
  const orderId = useSearchParams().get("order");
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!orderId) {
      setError("No order reference was provided.");
      return;
    }
    gqlAuth<{ getOrder: ApiOrder | null }>(
      `query($id: ID!) {
        getOrder(id: $id) {
          id mode status total createdAt
          address { fullName phone line1 city country }
          sellerOrders {
            id status subtotal
            seller { name slug deliveryEstimate }
            items {
              id name image quantity unitPrice total reviewable
              product { slug }
            }
          }
        }
      }`,
      { id: orderId }
    )
      .then((data) => {
        if (!data.getOrder) setError("We couldn't find that order.");
        else setOrder(data.getOrder);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Could not load your order.")
      );
  }, [orderId, user, loading, router]);

  if (error)
    return (
      <div className="mx-auto max-w-md rounded-lg bg-white p-8 text-center shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
        <p className="text-sm text-body">{error}</p>
        <Link
          href="/account/orders"
          className="mt-4 inline-block rounded bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          View My Orders
        </Link>
      </div>
    );

  if (!order)
    return (
      <p className="py-10 text-center text-sm text-muted">
        Loading your order…
      </p>
    );

  const reference = `#${order.id.slice(-8).toUpperCase()}`;
  const itemCount = order.sellerOrders.reduce(
    (n, so) => n + so.items.reduce((m, i) => m + i.quantity, 0),
    0
  );

  return (
    <div className="mx-auto max-w-3xl">
      {/* Confirmation banner */}
      <div className="rounded-lg bg-white p-8 text-center shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 13 4 4L19 7" />
          </svg>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-heading">
          Thank you for your order!
        </h1>
        <p className="mt-2 text-sm text-body">
          Your order{" "}
          <span className="font-semibold text-heading">{reference}</span> has
          been placed. We&apos;ve emailed you a confirmation and will notify you
          when it ships.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg bg-paper p-4 text-left sm:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Order
            </p>
            <p className="text-sm font-semibold text-heading">{reference}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Date
            </p>
            <p className="text-sm font-semibold text-heading">
              {new Date(order.createdAt).toLocaleDateString("en-AE", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Items
            </p>
            <p className="text-sm font-semibold text-heading">
              {itemCount} {order.mode === "WHOLESALE" ? "pcs" : "items"}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Total
            </p>
            <p className="text-sm font-bold text-primary">
              {formatAED(order.total)}
            </p>
          </div>
        </div>
      </div>

      {/* Delivery address */}
      {order.address && (
        <div className="mt-5 rounded-lg bg-white p-5 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
          <h2 className="text-sm font-bold text-heading">Delivering to</h2>
          <p className="mt-1 text-sm text-body">
            {order.address.fullName} · {order.address.phone}
            <br />
            {order.address.line1}, {order.address.city},{" "}
            {order.address.country}
          </p>
        </div>
      )}

      {/* Items grouped by seller */}
      <div className="mt-5 space-y-4">
        {order.sellerOrders.map((so) => (
          <div
            key={so.id}
            className="rounded-lg bg-white shadow-[0_1px_3px_rgba(43,52,69,0.1)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
              <Link
                href={`/seller/${so.seller.slug}`}
                className="text-sm font-semibold text-heading hover:text-primary"
              >
                {so.seller.name}
              </Link>
              <span className="text-xs text-muted">
                Arrives in {so.seller.deliveryEstimate}
              </span>
            </div>

            {so.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0"
              >
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
              </div>
            ))}

            <div className="flex justify-end px-5 py-3 text-sm text-muted">
              Subtotal:
              <span className="ml-1 font-bold text-heading">
                {formatAED(so.subtotal)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/account/orders/${order.id}`}
          className="flex-1 rounded bg-primary py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Track Your Order
        </Link>
        <Link
          href={order.mode === "WHOLESALE" ? "/wholesale" : "/"}
          className="flex-1 rounded border border-line bg-white py-3 text-center text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <>
      <Header />
      <Navbar />
      <main className="flex-1 bg-paper px-2 pb-14 pt-6">
        <div className="container mx-auto px-2">
          <Suspense
            fallback={
              <p className="py-10 text-center text-sm text-muted">Loading…</p>
            }
          >
            <ThankYou />
          </Suspense>
        </div>
      </main>
    </>
  );
}
