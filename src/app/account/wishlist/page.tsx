"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatAED } from "@/data/products";
import { gqlAuth } from "@/lib/graphql";
import { useAuth } from "@/lib/auth";
import { emitWishlistUpdated } from "@/lib/cart-count";
import type { ApiProduct } from "@/lib/types";

type WishItem = {
  id: string;
  mode: "RETAIL" | "WHOLESALE";
  product: ApiProduct;
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishItem[] | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    gqlAuth<{ getWishlist: WishItem[] }>(
      `query {
        getWishlist {
          id mode
          product {
            id slug name image retailPrice wholesaleFrom minOrder inStock
          }
        }
      }`
    ).then((data) => setItems(data.getWishlist));
  }, [user]);

  const remove = async (item: WishItem) => {
    await gqlAuth(
      `mutation($productId: ID!, $mode: Mode!) { removeFromWishlist(productId: $productId, mode: $mode) }`,
      { productId: item.product.id, mode: item.mode }
    );
    setItems((prev) => prev?.filter((i) => i.id !== item.id) ?? null);
    emitWishlistUpdated();
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
      <h1 className="text-xl font-bold text-heading">My Wishlist</h1>

      {!items ? (
        <p className="mt-6 text-sm text-muted">Loading wishlist…</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          Your wishlist is empty — tap the heart on any product to save it here.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => {
            const prefix = item.mode === "WHOLESALE" ? "/wholesale" : "";
            const price =
              item.mode === "WHOLESALE"
                ? (item.product.wholesaleFrom ?? item.product.retailPrice)
                : item.product.retailPrice;
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-lg border border-line p-4"
              >
                <Link
                  href={`${prefix}/product/${item.product.slug}`}
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-paper p-2"
                >
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    width={56}
                    height={56}
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
                    <span className="rounded-full bg-paper px-2 py-0.5 font-medium">
                      {item.mode}
                    </span>
                    {item.mode === "WHOLESALE" &&
                      ` · MOQ ${item.product.minOrder} pcs`}
                    {!item.product.inStock && (
                      <span className="ml-1 text-primary">· Out of stock</span>
                    )}
                  </p>
                </div>
                <span className="text-sm font-bold text-primary">
                  {item.mode === "WHOLESALE" ? "from " : ""}
                  {formatAED(price)}
                </span>
                <button
                  type="button"
                  onClick={() => remove(item)}
                  className="text-xs text-muted hover:text-primary"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
