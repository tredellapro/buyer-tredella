"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import { formatAED } from "@/data/products";
import { gqlAuth } from "@/lib/graphql";
import { useAuth } from "@/lib/auth";
import { emitCartUpdated } from "@/lib/cart-count";
import { apiMode, type ApiCart, type UiMode } from "@/lib/types";

const CART_FIELDS = `
  itemCount total
  groups {
    seller { id slug name verified deliveryEstimate }
    subtotal
    items {
      id quantity mode unitPrice total
      product { id slug name image minOrder stock }
    }
  }
`;

export default function CartPage({ mode }: { mode: UiMode }) {
  const [cart, setCart] = useState<ApiCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const prefix = mode === "wholesale" ? "/wholesale" : "";

  const load = useCallback(async () => {
    try {
      const data = await gqlAuth<{ getCart: ApiCart }>(
        `query($mode: Mode!) { getCart(mode: $mode) { ${CART_FIELDS} } }`,
        { mode: apiMode(mode) }
      );
      setCart(data.getCart);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load cart.");
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    load();
  }, [authLoading, user, load, router, pathname]);

  const mutate = async (mutation: string, variables: Record<string, unknown>) => {
    setError(null);
    try {
      const data = await gqlAuth<Record<string, ApiCart>>(mutation, variables);
      setCart(Object.values(data)[0]);
      emitCartUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update cart.");
    }
  };

  const updateQty = (cartItemId: string, quantity: number) =>
    mutate(
      `mutation($cartItemId: ID!, $quantity: Int!) {
        updateCartItem(cartItemId: $cartItemId, quantity: $quantity) { ${CART_FIELDS} }
      }`,
      { cartItemId, quantity }
    );

  const removeItem = (cartItemId: string) =>
    mutate(
      `mutation($cartItemId: ID!) {
        removeFromCart(cartItemId: $cartItemId) { ${CART_FIELDS} }
      }`,
      { cartItemId }
    );

  return (
    <>
      <Header />
      <Navbar />
      <main className="flex-1 bg-paper pb-14 pt-6">
        <div className="container mx-auto px-2">
          <h1 className="text-2xl font-bold text-heading">
            {mode === "wholesale" ? "Wholesale Cart" : "Shopping Cart"}
            {cart && (
              <span className="ml-2 text-sm font-normal text-muted">
                ({cart.itemCount} items)
              </span>
            )}
          </h1>
          {error && <p className="mt-2 text-sm text-primary">{error}</p>}

          {loading ? (
            <p className="mt-10 text-center text-sm text-muted">Loading cart…</p>
          ) : !cart || cart.groups.length === 0 ? (
            <div className="mt-6 rounded-lg bg-white py-16 text-center shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
              <p className="text-sm text-muted">Your cart is empty.</p>
              <Link
                href={prefix || "/"}
                className="mt-4 inline-block rounded bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-6 lg:flex-row">
              {/* Seller groups */}
              <div className="flex-1 space-y-5">
                {cart.groups.map((group) => (
                  <div
                    key={group.seller.id}
                    className="rounded-lg bg-white shadow-[0_1px_3px_rgba(43,52,69,0.1)]"
                  >
                    <div className="flex items-center justify-between border-b border-line px-5 py-3">
                      <Link
                        href={`${prefix}/seller/${group.seller.slug}`}
                        className="text-sm font-semibold text-heading hover:text-primary"
                      >
                        {group.seller.name}
                        {group.seller.verified && (
                          <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                            Verified
                          </span>
                        )}
                      </Link>
                      <span className="text-xs text-muted">
                        Delivery: {group.seller.deliveryEstimate}
                      </span>
                    </div>

                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-4 last:border-0"
                      >
                        <Link
                          href={`${prefix}/product/${item.product.slug}`}
                          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-paper p-2"
                        >
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={72}
                            height={72}
                            className="h-full w-full object-contain"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <Link
                            href={`${prefix}/product/${item.product.slug}`}
                            className="line-clamp-1 text-sm font-medium text-heading hover:text-primary"
                          >
                            {item.product.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted">
                            {formatAED(item.unitPrice)} / unit
                            {mode === "wholesale" &&
                              ` · MOQ ${item.product.minOrder} pcs`}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="mt-1 text-xs text-primary hover:underline"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="flex items-center rounded-md border border-line">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="h-8 w-8 text-heading hover:text-primary"
                          >
                            −
                          </button>
                          <span className="w-10 text-center text-sm font-semibold text-heading">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="h-8 w-8 text-heading hover:text-primary"
                          >
                            +
                          </button>
                        </div>

                        <span className="w-24 text-right text-sm font-bold text-primary">
                          {formatAED(item.total)}
                        </span>
                      </div>
                    ))}

                    <div className="flex justify-end px-5 py-3 text-sm">
                      <span className="text-muted">
                        Seller subtotal:{" "}
                        <span className="font-bold text-heading">
                          {formatAED(group.subtotal)}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <aside className="h-fit w-full rounded-lg bg-white p-5 shadow-[0_1px_3px_rgba(43,52,69,0.1)] lg:w-80">
                <h2 className="text-base font-bold text-heading">
                  Order Summary
                </h2>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-body">
                    <span>Items ({cart.itemCount})</span>
                    <span>{formatAED(cart.total)}</span>
                  </div>
                  <div className="flex justify-between text-body">
                    <span>Sellers</span>
                    <span>{cart.groups.length}</span>
                  </div>
                  <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-heading">
                    <span>Total</span>
                    <span className="text-primary">{formatAED(cart.total)}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted">
                  Final prices are recalculated securely at checkout.
                </p>
                <Link
                  href={`/checkout?mode=${apiMode(mode)}`}
                  className="mt-4 block rounded bg-primary py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  Proceed to Checkout
                </Link>
              </aside>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
