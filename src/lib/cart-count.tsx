"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { gqlAuth } from "./graphql";
import { useAuth } from "./auth";

const CART_EVENT = "tredella:cart-updated";
const WISHLIST_EVENT = "tredella:wishlist-updated";

/** Fire after any cart mutation so header/navbar badges refresh. */
export const emitCartUpdated = () => {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event(CART_EVENT));
};

/** Fire after any wishlist mutation so the header heart badge refreshes. */
export const emitWishlistUpdated = () => {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event(WISHLIST_EVENT));
};

/** Live wishlist item count (both modes combined). */
export function useWishlistCount() {
  const [count, setCount] = useState(0);
  const { user } = useAuth();

  const refresh = useCallback(() => {
    if (!user) {
      setCount(0);
      return;
    }
    gqlAuth<{ getWishlist: { id: string }[] }>(
      `query { getWishlist { id } }`
    )
      .then((data) => setCount(data.getWishlist.length))
      .catch(() => setCount(0));
  }, [user]);

  useEffect(() => {
    refresh();
    window.addEventListener(WISHLIST_EVENT, refresh);
    return () => window.removeEventListener(WISHLIST_EVENT, refresh);
  }, [refresh]);

  return count;
}

/** Live cart item count for the current mode (retail vs wholesale). */
export function useCartCount() {
  const [count, setCount] = useState(0);
  const { user } = useAuth();
  const pathname = usePathname();
  const mode = pathname.startsWith("/wholesale") ? "WHOLESALE" : "RETAIL";

  const refresh = useCallback(() => {
    if (!user) {
      setCount(0);
      return;
    }
    gqlAuth<{ getCart: { itemCount: number } }>(
      `query($mode: Mode!) { getCart(mode: $mode) { itemCount } }`,
      { mode }
    )
      .then((data) => setCount(data.getCart.itemCount))
      .catch(() => setCount(0));
  }, [user, mode]);

  useEffect(() => {
    refresh();
    window.addEventListener(CART_EVENT, refresh);
    return () => window.removeEventListener(CART_EVENT, refresh);
  }, [refresh]);

  return count;
}
