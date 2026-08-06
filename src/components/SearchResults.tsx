import ProductCard from "@/components/ProductCard";
import { gql } from "@/lib/graphql";
import {
  apiMode,
  toCardProduct,
  PRODUCT_CARD_FIELDS,
  type ApiProduct,
  type UiMode,
} from "@/lib/types";
import Link from "next/link";

import { categories } from "@/data/categories";

type Props = {
  mode: UiMode;
  query: string;
  sort?: string;
  page?: number;
  /** Category display name from the search box selector */
  category?: string;
};

const SORTS = [
  { key: "RELEVANCE", label: "Relevance" },
  { key: "NEWEST", label: "Newest" },
  { key: "PRICE_ASC", label: "Price: Low to High" },
  { key: "PRICE_DESC", label: "Price: High to Low" },
  { key: "BEST_RATED", label: "Best Rated" },
  { key: "MOST_POPULAR", label: "Most Popular" },
];

export default async function SearchResults({
  mode,
  query,
  sort = "RELEVANCE",
  page = 1,
  category,
}: Props) {
  const prefix = mode === "wholesale" ? "/wholesale" : "";
  const categorySlug = categories.find((c) => c.name === category)?.slug;
  const data = await gql<{
    getProducts: {
      items: ApiProduct[];
      pageInfo: { total: number; page: number; totalPages: number };
    };
  }>(
    `query Search($mode: Mode!, $filter: ProductFilterInput, $sortBy: SortBy, $page: Int) {
      getProducts(mode: $mode, filter: $filter, sortBy: $sortBy, page: $page, pageSize: 12) {
        items { ${PRODUCT_CARD_FIELDS} }
        pageInfo { total page totalPages }
      }
    }`,
    {
      mode: apiMode(mode),
      filter: { search: query, categorySlug },
      sortBy: sort,
      page,
    },
    { revalidate: 30 }
  );

  const { items, pageInfo } = data.getProducts;

  return (
    <main className="flex-1 bg-paper pb-14 pt-6">
      <div className="container mx-auto px-2">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white px-5 py-4 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
          <div>
            <h1 className="text-lg font-bold text-heading">
              Searching for &ldquo;{query}&rdquo;
            </h1>
            <p className="text-xs text-muted">{pageInfo.total} results found</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted">Sort by:</span>
            {SORTS.map((s) => (
              <Link
                key={s.key}
                href={`${prefix}/search?q=${encodeURIComponent(query)}&sort=${s.key}`}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  sort === s.key
                    ? "bg-primary text-white"
                    : "bg-paper text-body hover:text-primary"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {items.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={toCardProduct(p)} mode={mode} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-lg bg-white py-16 text-center shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
            <p className="text-sm text-muted">
              No products found for &ldquo;{query}&rdquo;. Try a different search.
            </p>
          </div>
        )}

        {pageInfo.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: pageInfo.totalPages }, (_, i) => i + 1).map(
              (n) => (
                <Link
                  key={n}
                  href={`${prefix}/search?q=${encodeURIComponent(query)}&sort=${sort}&page=${n}`}
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
