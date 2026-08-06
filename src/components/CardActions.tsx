"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { HiOutlineShoppingBag, HiOutlineHeart, HiHeart } from "react-icons/hi2";
import { gqlAuth } from "@/lib/graphql";
import { useAuth } from "@/lib/auth";
import { emitCartUpdated, emitWishlistUpdated } from "@/lib/cart-count";

type Props = {
  productSlug: string;
  minOrder?: number;
  mode: "retail" | "wholesale";
};

/* Quick actions floating over a product image. Wholesale gets wishlist only:
   its price depends on the quantity ordered, so buyers pick that on the
   product page rather than being quick-added at an arbitrary amount.

   Products are addressed by slug, not id — listing pages and the API don't
   share id spaces, but slugs are the stable public key in both. */
export default function CardActions({ productSlug, minOrder, mode }: Props) {
  const [wished, setWished] = useState(false);
  const [busy, setBusy] = useState<"cart" | "wish" | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isWholesale = mode === "wholesale";
  const apiMode = isWholesale ? "WHOLESALE" : "RETAIL";

  const requireLogin = () => {
    if (user) return true;
    toast.info("Please sign in to continue.");
    router.push(`/login?next=${encodeURIComponent(pathname)}`);
    return false;
  };

  const addToCart = async () => {
    if (!requireLogin()) return;
    setBusy("cart");
    try {
      await gqlAuth(
        `mutation($productSlug: String!, $quantity: Int!, $mode: Mode!) {
          addToCart(productSlug: $productSlug, quantity: $quantity, mode: $mode) { itemCount }
        }`,
        { productSlug, quantity: isWholesale ? (minOrder ?? 1) : 1, mode: apiMode }
      );
      emitCartUpdated();
      toast.success("Added to your cart");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not add this to your cart."
      );
    } finally {
      setBusy(null);
    }
  };

  const toggleWishlist = async () => {
    if (!requireLogin()) return;
    setBusy("wish");
    try {
      if (wished) {
        await gqlAuth(
          `mutation($productSlug: String!, $mode: Mode!) {
            removeFromWishlist(productSlug: $productSlug, mode: $mode)
          }`,
          { productSlug, mode: apiMode }
        );
        setWished(false);
        toast.success("Removed from your wishlist");
      } else {
        await gqlAuth(
          `mutation($productSlug: String!, $mode: Mode!) {
            addToWishlist(productSlug: $productSlug, mode: $mode) { id }
          }`,
          { productSlug, mode: apiMode }
        );
        setWished(true);
        toast.success("Saved to your wishlist");
      }
      emitWishlistUpdated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  };

  const buttonClass =
    "flex h-9 w-9 items-center justify-center rounded-full bg-white text-heading shadow-[0_2px_8px_rgba(43,52,69,0.18)] transition-colors hover:bg-primary hover:text-white disabled:opacity-60";

  return (
    <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
      {!isWholesale && (
        <button
          type="button"
          onClick={addToCart}
          disabled={busy !== null}
          aria-label="Add to cart"
          title="Add to cart"
          className={buttonClass}
        >
          <HiOutlineShoppingBag size={17} />
        </button>
      )}

      <button
        type="button"
        onClick={toggleWishlist}
        disabled={busy !== null}
        aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
        title={wished ? "Remove from wishlist" : "Save to wishlist"}
        className={`${buttonClass} ${wished ? "bg-primary text-white" : ""}`}
      >
        {wished ? <HiHeart size={17} /> : <HiOutlineHeart size={17} />}
      </button>
    </div>
  );
}
