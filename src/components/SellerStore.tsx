import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import SellerCard from "@/components/product/SellerCard";
import { gql } from "@/lib/graphql";
import {
  apiMode,
  toCardProduct,
  PRODUCT_CARD_FIELDS,
  type ApiProduct,
  type ApiSeller,
  type UiMode,
} from "@/lib/types";

type Props = { slug: string; mode: UiMode; sort?: string; page?: number };

const SORTS = [
  { key: "RELEVANCE", label: "Popular" },
  { key: "NEWEST", label: "Newest" },
  { key: "PRICE_ASC", label: "Price ↑" },
  { key: "PRICE_DESC", label: "Price ↓" },
  { key: "BEST_RATED", label: "Best Rated" },
];

export default async function SellerStore({ slug, mode, sort = "RELEVANCE", page = 1 }: Props) {
  const prefix = mode === "wholesale" ? "/wholesale" : "";

  const data = await gql<{
    getSeller: ApiSeller | null;
    getSellerProducts: {
      items: ApiProduct[];
      pageInfo: { total: number; page: number; totalPages: number };
    };
  }>(
    `query SellerStore($slug: String!, $mode: Mode!, $sortBy: SortBy, $page: Int) {
      getSeller(slug: $slug) {
        id slug name logo description verified rating positivePercent followers
        shipsFrom deliveryEstimate freeShippingOver joinedAt productCount
      }
      getSellerProducts(sellerSlug: $slug, mode: $mode, sortBy: $sortBy, page: $page, pageSize: 12) {
        items { ${PRODUCT_CARD_FIELDS} }
        pageInfo { total page totalPages }
      }
    }`,
    { slug, mode: apiMode(mode), sortBy: sort, page },
    { revalidate: 60 }
  );

  const seller = data.getSeller;
  if (!seller) notFound();
  const { items, pageInfo } = data.getSellerProducts;

  return (
    <main className="flex-1 bg-paper pb-14 pt-6">
      <div className="container mx-auto px-2">
        {/* Store header */}
        <div className="rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-2xl font-bold text-primary">
                {seller.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-heading">
                    {seller.name}
                  </h1>
                  {seller.verified && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                      Verified Seller
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-body">
                  <span className="text-amber-400">★</span>{" "}
                  <span className="font-semibold text-heading">
                    {seller.rating}
                  </span>{" "}
                  · {seller.productCount} products ·{" "}
                  {seller.followers.toLocaleString()} followers ·{" "}
                  {seller.positivePercent}% positive
                </p>
                {seller.description && (
                  <p className="mt-2 max-w-xl text-sm text-muted">
                    {seller.description}
                  </p>
                )}
              </div>
            </div>

            <div className="text-sm text-body">
              <p>
                Ships from:{" "}
                <span className="font-medium text-heading">{seller.shipsFrom}</span>
              </p>
              <p>
                Delivery:{" "}
                <span className="font-medium text-heading">
                  {seller.deliveryEstimate}
                </span>
              </p>
              <p>
                Joined:{" "}
                <span className="font-medium text-heading">
                  {new Date(seller.joinedAt).toLocaleDateString("en-AE", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-4 max-w-xs">
            <SellerCard
              seller={{
                slug: seller.slug,
                name: seller.name,
                rating: seller.rating,
                verified: seller.verified,
                positivePercent: seller.positivePercent,
                productCount: seller.productCount,
              }}
              modePrefix={prefix}
            />
          </div>
        </div>

        {/* Products */}
        <div className="mt-8 mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-heading">
            Seller Products{" "}
            <span className="text-sm font-normal text-muted">
              ({pageInfo.total}{mode === "wholesale" ? " · bulk pricing" : ""})
            </span>
          </h2>
          <div className="flex gap-2">
            {SORTS.map((s) => (
              <Link
                key={s.key}
                href={`${prefix}/seller/${slug}?sort=${s.key}`}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  sort === s.key
                    ? "bg-primary text-white"
                    : "bg-white text-body shadow-[0_1px_3px_rgba(43,52,69,0.1)] hover:text-primary"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={toCardProduct(p)} mode={mode} />
          ))}
        </div>

        {pageInfo.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: pageInfo.totalPages }, (_, i) => i + 1).map(
              (n) => (
                <Link
                  key={n}
                  href={`${prefix}/seller/${slug}?sort=${sort}&page=${n}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium ${
                    n === pageInfo.page
                      ? "border-primary bg-primary text-white"
                      : "border-line bg-white text-body hover:border-primary hover:text-primary"
                  }`}
                >
                  {n}
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}
