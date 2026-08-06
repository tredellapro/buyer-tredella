"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useCartCount, useWishlistCount } from "@/lib/cart-count";
import SearchBox from "./SearchBox";
import { UserIcon, BagIcon, HeartIcon, SwapIcon } from "./icons";

export default function Header() {
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();
  const isWholesale = pathname.startsWith("/wholesale");
  const prefix = isWholesale ? "/wholesale" : "";

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <header className="bg-white">
      <div className="container mx-auto px-2 flex items-center justify-between gap-4 py-4">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/assets/images/logo.png"
            alt="Tredella"
            width={150}
            height={44}
            priority
            className="h-10 w-auto"
          />
        </Link>

        {/* Search with suggestions + button */}
        <div className="hidden md:flex flex-1 justify-center">
          <SearchBox variant="desktop" />
        </div>

        {/* Account + Cart */}
        <div className="flex shrink-0 items-center gap-3">
          {/* Retail / Wholesale switcher */}
          <Link
            href={isWholesale ? "/" : "/wholesale"}
            className="flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-xs font-medium text-heading transition-colors hover:border-primary hover:text-primary sm:h-11 sm:gap-2 sm:px-5 sm:text-sm"
          >
            {isWholesale ? "Retail" : "Wholesale"}
            <SwapIcon size={14} />
          </Link>

          {/* Account menu */}
          <div ref={accountRef} className="relative">
            <button
              type="button"
              aria-label="Account"
              onClick={() => setAccountOpen(!accountOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-paper text-heading hover:bg-line/60"
            >
              <UserIcon size={22} />
            </button>

            {accountOpen && (
              <div className="absolute right-0 top-full z-30 mt-2 w-52 rounded-lg bg-white py-2 shadow-[0_4px_16px_rgba(43,52,69,0.15)]">
                {user ? (
                  <>
                    <p className="border-b border-line px-4 pb-2 text-sm font-semibold text-heading">
                      {user.name}
                    </p>
                    {[
                      { label: "My Account", href: "/account" },
                      { label: "Orders", href: "/account/orders" },
                      { label: "Wishlist", href: "/account/wishlist" },
                      { label: "Messages", href: "/account/messages" },
                      { label: "Notifications", href: "/account/notifications" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2 text-sm text-body hover:bg-paper hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setAccountOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-primary hover:bg-paper"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm text-body hover:bg-paper hover:text-primary"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm text-body hover:bg-paper hover:text-primary"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Wishlist */}
          <Link
            href="/account/wishlist"
            aria-label="Wishlist"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-paper text-heading hover:bg-line/60 hover:text-primary"
          >
            <HeartIcon size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href={`${prefix}/cart`}
            aria-label="Cart"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-paper text-heading hover:bg-line/60"
          >
            <BagIcon size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile search (below main row) */}
      <div className="container mx-auto px-2 pb-3 md:hidden">
        <SearchBox variant="mobile" />
      </div>
    </header>
  );
}
