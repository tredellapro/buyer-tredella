import Image from "next/image";
import Link from "next/link";
import { formatAED, type Product } from "@/data/products";

type Props = {
  product: Product;
  mode: "retail" | "wholesale";
};

const Stars = ({ rating }: { rating: number }) => (
  <span className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg
        key={i}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        className={i <= Math.round(rating) ? "fill-amber-400" : "fill-line"}
      >
        <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8-6.1-3.4-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
      </svg>
    ))}
  </span>
);

const tierLabel = (minQty: number, maxQty: number | null) =>
  maxQty ? `${minQty}–${maxQty} pcs` : `≥ ${minQty} pcs`;

export default function ProductCard({ product, mode }: Props) {
  const isWholesale = mode === "wholesale";
  const tiers = product.priceTiers ?? [];
  const discount =
    !isWholesale && product.price && product.oldPrice
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : tiers.length > 1
        ? Math.round((1 - tiers[tiers.length - 1].price / tiers[0].price) * 100)
        : 0;

  const detailHref = `${isWholesale ? "/wholesale" : ""}/product/${product.slug}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-[0_1px_3px_rgba(43,52,69,0.1)] transition-shadow hover:shadow-[0_8px_24px_rgba(43,52,69,0.15)]">
      {/* Image */}
      <Link href={detailHref} className="relative block">
        {discount > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white">
            {isWholesale ? `Save up to ${discount}%` : `${discount}% off`}
          </span>
        )}
        <div className="flex aspect-square items-center justify-center p-6">
          <Image
            src={product.image}
            alt={product.name}
            width={300}
            height={300}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1.5 border-t border-line p-4">
        <Link
          href={detailHref}
          className="line-clamp-2 text-sm font-medium text-heading hover:text-primary"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-1.5">
          <Stars rating={product.rating} />
          <span className="text-xs text-muted">({product.reviews})</span>
        </div>

        {/* Price — retail: single price / wholesale: Alibaba-style qty tiers */}
        {isWholesale ? (
          <div className="mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-primary">
                {formatAED(tiers[tiers.length - 1]?.price ?? 0)}
                {" – "}
                {formatAED(tiers[0]?.price ?? 0)}
              </span>
              <span className="text-xs text-muted">/ unit</span>
            </div>

            <div className="mt-2 space-y-1 rounded-md bg-paper px-3 py-2">
              {tiers.map((tier) => (
                <div
                  key={tier.minQty}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-muted">
                    {tierLabel(tier.minQty, tier.maxQty)}
                  </span>
                  <span className="font-semibold text-heading">
                    {formatAED(tier.price)}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-1.5 text-xs text-muted">
              Min. order:{" "}
              <span className="font-semibold text-heading">
                {product.minOrder} pcs
              </span>
              {product.sold ? ` · ${(product.sold / 1000).toFixed(1)}k sold` : ""}
            </p>
          </div>
        ) : (
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              {formatAED(product.price ?? 0)}
            </span>
            {product.oldPrice && (
              <span className="text-xs text-muted line-through">
                {formatAED(product.oldPrice)}
              </span>
            )}
          </div>
        )}

        <Link
          href={detailHref}
          className="mt-auto rounded bg-primary py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          {isWholesale ? "Get Bulk Quote" : "Add to Cart"}
        </Link>
      </div>
    </div>
  );
}
