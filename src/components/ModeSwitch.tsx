"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SwapIcon } from "./icons";

/* Retail ⇄ Wholesale switcher. Lives in the header on desktop and in the
   category bar on mobile, where header space is tight. */
export default function ModeSwitch({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const isWholesale = pathname.startsWith("/wholesale");

  return (
    <Link
      href={isWholesale ? "/" : "/wholesale"}
      className={`flex h-10 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-xs font-medium text-heading transition-colors hover:border-primary hover:text-primary sm:text-sm ${className}`}
    >
      {isWholesale ? "Retail" : "Wholesale"}
      <SwapIcon size={14} />
    </Link>
  );
}
