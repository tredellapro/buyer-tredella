"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { formatAED } from "@/data/products";
import { gqlAuth } from "@/lib/graphql";
import { apiMode, type ApiProduct, type UiMode } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { emitCartUpdated, emitWishlistUpdated } from "@/lib/cart-count";

type Props = { product: ApiProduct; mode: UiMode };

/* Quantity → unit price preview uses the same tier data the backend serves;
   the backend re-derives every price on addToCart/createOrder (source of truth). */
const tierPriceFor = (product: ApiProduct, qty: number) => {
  const tiers = [...product.priceTiers].sort((a, b) => a.minQty - b.minQty);
  const match = tiers.find(
    (t) => qty >= t.minQty && (t.maxQty == null || qty <= t.maxQty)
  );
  return (match ?? tiers.find((t) => t.maxQty == null) ?? tiers[0])?.price ?? 0;
};

export default function BuyBox({ product, mode }: Props) {
  const isWholesale = mode === "wholesale";
  const minQty = isWholesale ? product.minOrder : 1;
  const [quantity, setQuantity] = useState(minQty);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [wished, setWished] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const unitPrice = useMemo(
    () =>
      isWholesale ? tierPriceFor(product, quantity) : product.retailPrice,
    [isWholesale, product, quantity]
  );
  const total = Math.round(unitPrice * quantity * 100) / 100;

  const requireLogin = () => {
    if (user) return true;
    router.push(`/login?next=${encodeURIComponent(pathname)}`);
    return false;
  };

  const setQty = (next: number) =>
    setQuantity(Math.max(minQty, Math.min(product.stock, next)));

  const addToCart = async () => {
    if (!requireLogin()) return;
    setBusy(true);
    setFeedback(null);
    try {
      await gqlAuth(
        `mutation AddToCart($productId: ID!, $quantity: Int!, $mode: Mode!) {
          addToCart(productId: $productId, quantity: $quantity, mode: $mode) { itemCount }
        }`,
        { productId: product.id, quantity, mode: apiMode(mode) }
      );
      setFeedback("Added to cart ✓");
      emitCartUpdated();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const toggleWishlist = async () => {
    if (!requireLogin()) return;
    try {
      if (wished) {
        await gqlAuth(
          `mutation($productId: ID!, $mode: Mode!) { removeFromWishlist(productId: $productId, mode: $mode) }`,
          { productId: product.id, mode: apiMode(mode) }
        );
        setWished(false);
        emitWishlistUpdated();
      } else {
        await gqlAuth(
          `mutation($productId: ID!, $mode: Mode!) { addToWishlist(productId: $productId, mode: $mode) { id } }`,
          { productId: product.id, mode: apiMode(mode) }
        );
        setWished(true);
        emitWishlistUpdated();
      }
    } catch {
      /* keep silent for wishlist */
    }
  };

  return (
    <div>
      {/* Price block */}
      {isWholesale ? (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-heading">
            Wholesale Pricing
          </h3>
          <div className="overflow-hidden rounded-lg border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-paper text-left text-xs text-muted">
                  <th className="px-4 py-2 font-medium">Quantity</th>
                  <th className="px-4 py-2 font-medium">Unit Price</th>
                </tr>
              </thead>
              <tbody>
                {product.priceTiers.map((tier) => {
                  const active =
                    quantity >= tier.minQty &&
                    (tier.maxQty == null || quantity <= tier.maxQty);
                  return (
                    <tr
                      key={tier.minQty}
                      className={active ? "bg-primary-light" : ""}
                    >
                      <td className="px-4 py-2 text-body">
                        {tier.maxQty
                          ? `${tier.minQty} - ${tier.maxQty} units`
                          : `${tier.minQty}+ units`}
                      </td>
                      <td
                        className={`px-4 py-2 font-semibold ${
                          active ? "text-primary" : "text-heading"
                        }`}
                      >
                        {formatAED(tier.price)} / unit
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">
            Min. order:{" "}
            <span className="font-semibold text-heading">
              {product.minOrder} pcs
            </span>
          </p>
        </div>
      ) : (
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary">
            {formatAED(product.retailPrice)}
          </span>
          {product.oldPrice && (
            <span className="text-base text-muted line-through">
              {formatAED(product.oldPrice)}
            </span>
          )}
        </div>
      )}

      {/* Quantity + live total */}
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-md border border-line">
          <button
            type="button"
            onClick={() => setQty(quantity - 1)}
            className="h-10 w-10 text-lg text-heading hover:text-primary"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            type="number"
            value={quantity}
            min={minQty}
            max={product.stock}
            onChange={(e) => setQty(parseInt(e.target.value) || minQty)}
            className="h-10 w-16 border-x border-line text-center text-sm font-semibold text-heading outline-none"
          />
          <button
            type="button"
            onClick={() => setQty(quantity + 1)}
            className="h-10 w-10 text-lg text-heading hover:text-primary"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <div className="text-sm text-muted">
          <span className="font-semibold text-heading">
            {formatAED(unitPrice)}
          </span>{" "}
          / unit ·{" "}
          <span className="font-bold text-primary">Total {formatAED(total)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addToCart}
          disabled={busy || !product.inStock}
          className="rounded bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {product.inStock
            ? isWholesale
              ? "Add Bulk Order to Cart"
              : "Add to Cart"
            : "Out of Stock"}
        </button>

        <button
          type="button"
          onClick={toggleWishlist}
          aria-label="Add to wishlist"
          className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
            wished
              ? "border-primary bg-primary-light text-primary"
              : "border-line text-muted hover:border-primary hover:text-primary"
          }`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={wished ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 21C7 17 3 13.5 3 9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 9 2.5c0 4-4 7.5-9 11.5Z" />
          </svg>
        </button>

        {feedback && (
          <span
            className={`text-sm font-medium ${
              feedback.includes("✓") ? "text-green-600" : "text-primary"
            }`}
          >
            {feedback}
          </span>
        )}
      </div>
    </div>
  );
}
