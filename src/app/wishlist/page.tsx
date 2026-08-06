"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import { formatAED } from "@/data/products";
import { gqlAuth } from "@/lib/graphql";
import { toast } from "react-toastify";
import { useAuth } from "@/lib/auth";
import { emitCartUpdated, emitWishlistUpdated } from "@/lib/cart-count";
import type { ApiProduct } from "@/lib/types";

type WishItem = {
  id: string;
  mode: "RETAIL" | "WHOLESALE";
  product: ApiProduct;
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishItem[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login?next=%2Fwishlist");
      return;
    }
    gqlAuth<{ getWishlist: WishItem[] }>(
      `query {
        getWishlist {
          id mode
          product {
            id slug name image retailPrice wholesaleFrom minOrder inStock
            priceTiers { minQty maxQty price }
          }
        }
      }`
    ).then((data) => setItems(data.getWishlist));
  }, [user, loading, router]);

  const remove = async (item: WishItem) => {
    await gqlAuth(
      `mutation($productId: ID!, $mode: Mode!) { removeFromWishlist(productId: $productId, mode: $mode) }`,
      { productId: item.product.id, mode: item.mode }
    );
    setItems((prev) => prev?.filter((i) => i.id !== item.id) ?? null);
    emitWishlistUpdated();
  };

  /* Move to cart: add at the minimum sellable quantity, then drop it from the
     wishlist so the item lives in exactly one place. */
  const moveToCart = async (item: WishItem) => {
    setBusyId(item.id);
    try {
      const quantity =
        item.mode === "WHOLESALE" ? (item.product.minOrder ?? 1) : 1;
      await gqlAuth(
        `mutation($productId: ID!, $quantity: Int!, $mode: Mode!) {
          addToCart(productId: $productId, quantity: $quantity, mode: $mode) { itemCount }
        }`,
        { productId: item.product.id, quantity, mode: item.mode }
      );
      emitCartUpdated();
      await remove(item);
      toast.success(`${item.product.name} moved to your cart`);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not add this item to the cart."
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Header />
      <Navbar />
      <main className="flex-1 bg-paper pb-14 pt-6">
        <div className="container mx-auto px-2">
          <h1 className="text-2xl font-bold text-heading">
            My Wishlist
            {items && items.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted">
                ({items.length} saved)
              </span>
            )}
          </h1>

          {!items ? (
            <p className="mt-10 text-center text-sm text-muted">
              Loading your wishlist…
            </p>
          ) : items.length === 0 ? (
            <div className="mt-6 rounded-lg bg-white py-16 text-center shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-paper text-2xl">
                ♡
              </div>
              <p className="text-sm text-muted">
                Your wishlist is empty — tap the heart on any product to save it
                for later.
              </p>
              <Link
                href="/"
                className="mt-4 inline-block rounded bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {items.map((item) => {
                const prefix = item.mode === "WHOLESALE" ? "/wholesale" : "";
                const tiers = item.product.priceTiers ?? [];
                const price =
                  item.mode === "WHOLESALE"
                    ? (tiers[0]?.price ??
                      item.product.wholesaleFrom ??
                      item.product.retailPrice)
                    : item.product.retailPrice;

                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center gap-4 rounded-lg bg-white p-4 shadow-[0_1px_3px_rgba(43,52,69,0.1)]"
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
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                        <span className="rounded-full bg-paper px-2 py-0.5 font-medium">
                          {item.mode}
                        </span>
                        {item.mode === "WHOLESALE" && (
                          <span>MOQ {item.product.minOrder} pcs</span>
                        )}
                        {!item.product.inStock && (
                          <span className="text-primary">Out of stock</span>
                        )}
                      </p>
                      <p className="mt-1 text-base font-bold text-primary">
                        {formatAED(price)}
                        {item.mode === "WHOLESALE" && (
                          <span className="ml-1 text-xs font-normal text-muted">
                            / unit
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Wholesale pricing depends on the quantity ordered, so
                          buyers choose it on the product page instead. */}
                      {item.mode === "WHOLESALE" ? (
                        <Link
                          href={`${prefix}/product/${item.product.slug}`}
                          className="rounded bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                        >
                          View Product
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => moveToCart(item)}
                          disabled={busyId === item.id || !item.product.inStock}
                          className="rounded bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
                        >
                          {busyId === item.id ? "Adding…" : "Add to Cart"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(item)}
                        aria-label={`Remove ${item.product.name} from wishlist`}
                        className="rounded border border-line px-3 py-2.5 text-sm text-muted hover:border-primary hover:text-primary"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
