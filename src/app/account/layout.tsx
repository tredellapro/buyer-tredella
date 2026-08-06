"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth";

const links = [
  { label: "Profile", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Wishlist", href: "/account/wishlist" },
  { label: "Messages", href: "/account/messages" },
  { label: "Notifications", href: "/account/notifications" },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user)
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  return (
    <>
      <Header />
      <Navbar />
      <main className="flex-1 bg-paper pb-14 pt-6">
        <div className="container mx-auto px-2">
          <div className="flex flex-col gap-6 lg:flex-row">
            <aside className="h-fit w-full shrink-0 rounded-lg bg-white p-3 shadow-[0_1px_3px_rgba(43,52,69,0.1)] lg:w-60">
              {links.map((link) => {
                const active =
                  link.href === "/account"
                    ? pathname === "/account"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block rounded-md px-4 py-2.5 text-sm ${
                      active
                        ? "bg-primary-light font-semibold text-primary"
                        : "text-body hover:bg-paper hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </aside>
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </div>
      </main>
    </>
  );
}
