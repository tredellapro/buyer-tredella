"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { GridIcon, ChevronDownIcon } from "./icons";
import {
  effectivePrice,
  getBrand,
  getBrandsForCategory,
  getProductsByCategory,
  getSubcategories,
  priceLabel,
  subcategoryHref,
  type Mode,
  type Product,
} from "@/data/products";
import { categories } from "@/data/categories";

type Props = {
  mode: Mode;
  category: string; // category slug
  subcategory?: string;
  /** Mega-menu item term (e.g. "Shirt") — filters the category by name match */
  searchTerm?: string;
};

const PAGE_SIZE = 12;

type SortKey = "relevance" | "price-asc" | "price-desc" | "rating";

const Stars = ({ rating }: { rating: number }) => (
  <span className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg
        key={i}
        width="13"
        height="13"
        viewBox="0 0 24 24"
        className={i <= rating ? "fill-amber-400" : "fill-line"}
      >
        <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8-6.1-3.4-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
      </svg>
    ))}
  </span>
);

/* List-view row card — same info as ProductCard, horizontal layout */
function ListCard({ product, mode }: { product: Product; mode: Mode }) {
  const prefix = mode === "wholesale" ? "/wholesale" : "";
  const detailHref = `${prefix}/product/${product.slug}`;

  return (
    <div className="flex gap-5 rounded-lg bg-white p-4 shadow-[0_1px_3px_rgba(43,52,69,0.1)] transition-shadow hover:shadow-[0_8px_24px_rgba(43,52,69,0.15)]">
      <Link
        href={detailHref}
        className="flex h-36 w-36 shrink-0 items-center justify-center rounded-lg bg-paper p-3"
      >
        <Image
          src={product.image}
          alt={product.name}
          width={140}
          height={140}
          className="h-full w-full object-contain"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-center gap-1">
        <Link
          href={detailHref}
          className="text-sm font-medium text-heading hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1.5">
          <Stars rating={Math.round(product.rating)} />
          <span className="text-xs text-muted">({product.reviews})</span>
        </div>
        <p className="text-base font-bold text-primary">
          {priceLabel(product, mode)}
          {mode === "wholesale" && (
            <span className="ml-1 text-xs font-normal text-muted">/ unit</span>
          )}
        </p>
        {mode === "wholesale" && (
          <p className="text-xs text-muted">
            Min. order:{" "}
            <span className="font-semibold text-heading">
              {product.minOrder} pcs
            </span>
          </p>
        )}
      </div>

      <div className="hidden items-center sm:flex">
        <Link
          href={detailHref}
          className="rounded bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          {mode === "wholesale" ? "Get Bulk Quote" : "Add to Cart"}
        </Link>
      </div>
    </div>
  );
}

/* Advanced category / subcategory listing — sidebar filters, sorting,
   grid/list view, pagination. Same design for retail & wholesale; wholesale
   additionally gets an Alibaba-style Min. Order (MOQ) filter. */
/* Matches "Smartphones" against "Vivo V21 Smartphone" etc. — the plural
   term also matches its singular form. */
const matchesTerm = (name: string, term: string) => {
  const haystack = name.toLowerCase();
  const needle = term.toLowerCase();
  return (
    haystack.includes(needle) || haystack.includes(needle.replace(/e?s$/, ""))
  );
};

export default function CategoryListing({
  mode,
  category,
  subcategory,
  searchTerm,
}: Props) {
  const categoryInfo = categories.find((c) => c.slug === category);
  const subcategories = getSubcategories(category);
  const brands = getBrandsForCategory(mode, category);
  const prefix = mode === "wholesale" ? "/wholesale" : "";
  const isWholesale = mode === "wholesale";

  // filter state
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [minRating, setMinRating] = useState(0);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [maxMoq, setMaxMoq] = useState(0); // wholesale: 0 = any
  const [sort, setSort] = useState<SortKey>("relevance");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  const toggleBrand = (brand: string) => {
    const next = new Set(selectedBrands);
    if (next.has(brand)) next.delete(brand);
    else next.add(brand);
    setSelectedBrands(next);
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = getProductsByCategory(mode, category);
    if (subcategory) list = list.filter((p) => p.subcategory === subcategory);
    if (searchTerm) list = list.filter((p) => matchesTerm(p.name, searchTerm));

    const min = parseFloat(priceMin);
    const max = parseFloat(priceMax);
    if (!Number.isNaN(min)) list = list.filter((p) => effectivePrice(p, mode) >= min);
    if (!Number.isNaN(max)) list = list.filter((p) => effectivePrice(p, mode) <= max);

    if (selectedBrands.size > 0)
      list = list.filter((p) => selectedBrands.has(getBrand(p)));

    if (minRating > 0) list = list.filter((p) => p.rating >= minRating);

    if (!isWholesale && onSaleOnly)
      list = list.filter((p) => p.oldPrice && p.price && p.oldPrice > p.price);

    if (isWholesale && maxMoq > 0)
      list = list.filter((p) => (p.minOrder ?? 0) <= maxMoq);

    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => effectivePrice(a, mode) - effectivePrice(b, mode));
        break;
      case "price-desc":
        list = [...list].sort((a, b) => effectivePrice(b, mode) - effectivePrice(a, mode));
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
    }
    return list;
  }, [mode, category, subcategory, searchTerm, priceMin, priceMax, selectedBrands, minRating, onSaleOnly, maxMoq, sort, isWholesale]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const checkboxClass =
    "h-4 w-4 shrink-0 accent-[#e94560] cursor-pointer";

  return (
    <main className="flex-1 bg-paper pb-14 pt-6">
      <div className="container mx-auto px-2">
        {/* Top bar: title, count, sort, view toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white px-5 py-4 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
          <div>
            <nav aria-label="Breadcrumb" className="text-xs text-muted">
              <Link href={prefix || "/"} className="hover:text-primary">
                Home
              </Link>{" "}
              /{" "}
              <Link
                href={`${prefix}/${category}`}
                className="capitalize hover:text-primary"
              >
                {categoryInfo?.name ?? category}
              </Link>
              {(searchTerm ?? subcategory) && <> / {searchTerm ?? subcategory}</>}
            </nav>
            <h1 className="mt-0.5 text-lg font-bold text-heading">
              {searchTerm ?? subcategory ?? categoryInfo?.name ?? category}
              {isWholesale && (
                <span className="ml-2 rounded-full bg-primary-light px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  Wholesale
                </span>
              )}
            </h1>
            <p className="text-xs text-muted">{filtered.length} results found</p>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-muted">
              Sort by:
              <span className="relative">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as SortKey);
                    setPage(1);
                  }}
                  className="appearance-none rounded-md border border-line bg-white py-2 pl-3 pr-8 text-sm text-heading outline-none focus:border-primary"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDownIcon
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
                />
              </span>
            </label>

            <div className="flex items-center gap-1 text-sm text-muted">
              View:
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setView("grid")}
                className={`ml-1 rounded p-1.5 ${view === "grid" ? "text-primary" : "text-muted hover:text-heading"}`}
              >
                <GridIcon size={17} />
              </button>
              <button
                type="button"
                aria-label="List view"
                onClick={() => setView("list")}
                className={`rounded p-1.5 ${view === "list" ? "text-primary" : "text-muted hover:text-heading"}`}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="4" width="18" height="3.5" rx="1" />
                  <rect x="3" y="10.25" width="18" height="3.5" rx="1" />
                  <rect x="3" y="16.5" width="18" height="3.5" rx="1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-5 lg:flex-row">
          {/* ---------------- Sidebar filters ---------------- */}
          <aside className="h-fit w-full shrink-0 rounded-lg bg-white p-5 shadow-[0_1px_3px_rgba(43,52,69,0.1)] lg:w-72">
            {/* Categories */}
            <h3 className="mb-3 text-sm font-semibold text-heading">
              Categories
            </h3>
            <ul className="space-y-1">
              {categories
                .filter((c) => getSubcategories(c.slug).length > 0)
                .map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`${prefix}/${cat.slug}`}
                      className={`flex items-center justify-between py-1 text-sm ${
                        cat.slug === category
                          ? "font-semibold text-primary"
                          : "text-body hover:text-primary"
                      }`}
                    >
                      {cat.name}
                      {cat.slug === category && <ChevronDownIcon size={14} />}
                    </Link>
                    {cat.slug === category && (
                      <ul className="mb-1 ml-3 space-y-1 border-l border-line pl-3">
                        {getSubcategories(cat.slug).map((sub) => (
                          <li key={sub}>
                            <Link
                              href={subcategoryHref(mode, cat.slug, sub)}
                              className={`block py-0.5 text-sm ${
                                subcategory === sub
                                  ? "font-medium text-primary"
                                  : "text-muted hover:text-primary"
                              }`}
                            >
                              {sub}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
            </ul>

            <hr className="my-5 border-line" />

            {/* Price range */}
            <h3 className="mb-3 text-sm font-semibold text-heading">
              Price Range (AED{isWholesale ? " / unit" : ""})
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                placeholder="0"
                value={priceMin}
                onChange={(e) => {
                  setPriceMin(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-primary"
              />
              <span className="text-muted">–</span>
              <input
                type="number"
                min={0}
                placeholder="10,000"
                value={priceMax}
                onChange={(e) => {
                  setPriceMax(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-primary"
              />
            </div>

            <hr className="my-5 border-line" />

            {/* Brands */}
            <h3 className="mb-3 text-sm font-semibold text-heading">Brands</h3>
            <ul className="space-y-2">
              {brands.map((brand) => (
                <li key={brand}>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-body hover:text-primary">
                    <input
                      type="checkbox"
                      checked={selectedBrands.has(brand)}
                      onChange={() => toggleBrand(brand)}
                      className={checkboxClass}
                    />
                    {brand}
                  </label>
                </li>
              ))}
            </ul>

            <hr className="my-5 border-line" />

            {/* Mode-specific filters */}
            {isWholesale ? (
              <>
                {/* Alibaba-style MOQ filter — wholesale only */}
                <h3 className="mb-3 text-sm font-semibold text-heading">
                  Min. Order (MOQ)
                </h3>
                <ul className="space-y-2">
                  {[
                    { label: "Any", value: 0 },
                    { label: "≤ 10 pcs", value: 10 },
                    { label: "≤ 20 pcs", value: 20 },
                    { label: "≤ 50 pcs", value: 50 },
                  ].map((option) => (
                    <li key={option.value}>
                      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-body hover:text-primary">
                        <input
                          type="radio"
                          name="moq"
                          checked={maxMoq === option.value}
                          onChange={() => {
                            setMaxMoq(option.value);
                            setPage(1);
                          }}
                          className={checkboxClass}
                        />
                        {option.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-body hover:text-primary">
                <input
                  type="checkbox"
                  checked={onSaleOnly}
                  onChange={(e) => {
                    setOnSaleOnly(e.target.checked);
                    setPage(1);
                  }}
                  className={checkboxClass}
                />
                On Sale
              </label>
            )}

            <hr className="my-5 border-line" />

            {/* Ratings */}
            <h3 className="mb-3 text-sm font-semibold text-heading">Ratings</h3>
            <ul className="space-y-2">
              {[4, 3, 2, 1].map((stars) => (
                <li key={stars}>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-body">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === stars}
                      onChange={() => {
                        setMinRating(stars);
                        setPage(1);
                      }}
                      className={checkboxClass}
                    />
                    <Stars rating={stars} />
                    <span className="text-muted">&amp; up</span>
                  </label>
                </li>
              ))}
              {minRating > 0 && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setMinRating(0);
                      setPage(1);
                    }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Clear rating filter
                  </button>
                </li>
              )}
            </ul>
          </aside>

          {/* ---------------- Products ---------------- */}
          <div className="min-w-0 flex-1">
            {paged.length > 0 ? (
              view === "grid" ? (
                <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {paged.map((product) => (
                    <ProductCard key={product.id} product={product} mode={mode} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {paged.map((product) => (
                    <ListCard key={product.id} product={product} mode={mode} />
                  ))}
                </div>
              )
            ) : (
              <div className="rounded-lg bg-white py-16 text-center shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
                <p className="text-sm text-muted">
                  No products match your filters. Try clearing some filters.
                </p>
              </div>
            )}

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length} products
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setPage(n)}
                          className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium ${
                            n === currentPage
                              ? "border-primary bg-primary text-white"
                              : "border-line bg-white text-body hover:border-primary hover:text-primary"
                          }`}
                        >
                          {n}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
