"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { gqlAuth } from "@/lib/graphql";
import { useAuth } from "@/lib/auth";
import type { ApiSeller } from "@/lib/types";

type Props = {
  seller: Pick<
    ApiSeller,
    "slug" | "name" | "rating" | "verified" | "positivePercent" | "productCount"
  >;
  productId?: string;
  modePrefix: string;
};

export default function SellerCard({ seller, productId, modePrefix }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const contactSeller = async () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    const data = await gqlAuth<{ startConversation: { id: string } }>(
      `mutation($type: String!, $sellerSlug: String, $productId: ID) {
        startConversation(type: $type, sellerSlug: $sellerSlug, productId: $productId) { id }
      }`,
      { type: "BUYER_SELLER", sellerSlug: seller.slug, productId }
    );
    router.push(`/account/messages?c=${data.startConversation.id}`);
  };

  return (
    <div className="rounded-lg bg-white p-5 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
      <p className="text-xs uppercase tracking-wide text-muted">Sold By</p>
      <div className="mt-1 flex items-center gap-2">
        <h3 className="text-base font-semibold text-heading">{seller.name}</h3>
        {seller.verified && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
            Verified
          </span>
        )}
      </div>

      <div className="mt-2 space-y-1 text-sm text-body">
        <p>
          <span className="text-amber-400">★</span>{" "}
          <span className="font-semibold text-heading">{seller.rating}</span>{" "}
          seller rating
        </p>
        <p>{seller.productCount.toLocaleString()} products</p>
        <p>{seller.positivePercent}% positive rating</p>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href={`${modePrefix}/seller/${seller.slug}`}
          className="flex-1 rounded border border-primary py-2 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
        >
          Visit Store
        </Link>
        <button
          type="button"
          onClick={contactSeller}
          className="flex-1 rounded bg-primary py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Contact Seller
        </button>
      </div>
    </div>
  );
}
