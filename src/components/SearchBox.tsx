"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { categories, searchCategories } from "@/data/categories";
import { formatAED, getSubcategoryLinks } from "@/data/products";
import { gql } from "@/lib/graphql";
import { SearchIcon, ChevronDownIcon, ChevronRightIcon } from "./icons";

type Props = { variant?: "desktop" | "mobile" };

type SuggestedProduct = {
  slug: string;
  name: string;
  image: string;
  retailPrice: number;
  wholesaleFrom: number | null;
};

type CategoryLink = { label: string; href: string; parent: string };

/* Matching subcategories + mega-menu items from local nav data */
const matchCategoryLinks = (term: string, prefix: string): CategoryLink[] => {
  const needle = term.toLowerCase();
  const links: CategoryLink[] = [];

  for (const cat of categories) {
    for (const sub of getSubcategoryLinks(cat.slug)) {
      if (sub.name.toLowerCase().includes(needle))
        links.push({
          label: sub.name,
          parent: cat.name,
          href: `${prefix}/${cat.slug}/${sub.slug}`,
        });
    }
    for (const group of cat.megaMenu ?? []) {
      for (const item of group.items) {
        if (item.name.toLowerCase().includes(needle))
          links.push({
            label: item.name,
            parent: cat.name,
            href: `${prefix}${item.href}`,
          });
      }
    }
  }

  // dedupe by label, cap at 6
  const seen = new Set<string>();
  return links
    .filter((l) => (seen.has(l.label) ? false : (seen.add(l.label), true)))
    .slice(0, 6);
};

export default function SearchBox({ variant = "desktop" }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(searchCategories[0]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [products, setProducts] = useState<SuggestedProduct[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const prefix = pathname.startsWith("/wholesale") ? "/wholesale" : "";
  const mode = prefix ? "WHOLESALE" : "RETAIL";
  const isMobile = variant === "mobile";

  const categoryLinks =
    query.trim().length >= 2 ? matchCategoryLinks(query.trim(), prefix) : [];

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setCategoryOpen(false);
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* Debounced live product suggestions */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setProducts([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const categorySlug = categories.find((c) => c.name === category)?.slug;
        const data = await gql<{
          getProducts: { items: SuggestedProduct[] };
        }>(
          `query($mode: Mode!, $filter: ProductFilterInput) {
            getProducts(mode: $mode, filter: $filter, pageSize: 6) {
              items { slug name image retailPrice wholesaleFrom }
            }
          }`,
          {
            mode,
            filter: { search: query.trim(), categorySlug },
          },
          { revalidate: 0 }
        );
        setProducts(data.getProducts.items);
      } catch {
        setProducts([]);
      }
      setOpen(true);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, mode, category]);

  const closeAll = () => {
    setOpen(false);
    setCategoryOpen(false);
  };

  const goSearch = (term: string) => {
    if (!term.trim()) return;
    closeAll();
    const categoryFilter =
      category !== "All Categories"
        ? `&category=${encodeURIComponent(category)}`
        : "";
    router.push(
      `${prefix}/search?q=${encodeURIComponent(term.trim())}${categoryFilter}`
    );
  };

  const price = (p: SuggestedProduct) =>
    mode === "WHOLESALE" && p.wholesaleFrom != null
      ? `from ${formatAED(p.wholesaleFrom)}`
      : formatAED(p.retailPrice);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl">
      <div className="flex w-full items-center rounded-full border border-line bg-white transition-colors focus-within:border-primary">
        <button
          type="button"
          aria-label="Search"
          onClick={() => goSearch(query)}
          className="ml-4 shrink-0 text-muted hover:text-primary"
        >
          <SearchIcon size={isMobile ? 17 : 18} />
        </button>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && goSearch(query)}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          placeholder={isMobile ? "Search products..." : "Search and hit enter..."}
          className={`w-full bg-transparent px-3 text-sm outline-none placeholder:text-muted ${
            isMobile ? "h-10" : "h-11"
          }`}
        />

        {/* Category selector — desktop only */}
        {!isMobile && (
          <div className="relative h-11 shrink-0">
            <button
              type="button"
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="flex h-full items-center gap-1.5 rounded-r-full border-l border-line bg-paper px-4 text-sm text-heading hover:bg-line/60"
            >
              {category}
              <ChevronDownIcon size={16} className="text-muted" />
            </button>

            {categoryOpen && (
              <div className="absolute right-0 top-full z-30 mt-2 max-h-72 w-52 overflow-y-auto rounded-lg bg-white py-2 shadow-[0_4px_16px_rgba(43,52,69,0.15)]">
                {searchCategories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCategory(c);
                      setCategoryOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm hover:bg-paper hover:text-primary ${
                      c === category ? "text-primary" : "text-body"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rich suggestions panel: products left, categories right */}
      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-lg bg-white shadow-[0_4px_16px_rgba(43,52,69,0.15)]">
          <div className="flex flex-col sm:flex-row">
            {/* Products */}
            <div className="min-w-0 flex-1 py-2">
              <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                Products
              </p>
              {products.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted">
                  No matching products.
                </p>
              ) : (
                products.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => {
                      closeAll();
                      router.push(`${prefix}/product/${p.slug}`);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-paper"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-paper p-1">
                      <Image
                        src={p.image}
                        alt={p.name}
                        width={32}
                        height={32}
                        className="h-full w-full object-contain"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-heading">
                        {p.name}
                      </span>
                      <span className="text-xs font-semibold text-primary">
                        {price(p)}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Subcategories */}
            {categoryLinks.length > 0 && (
              <div className="w-full shrink-0 border-t border-line bg-paper/50 py-2 sm:w-56 sm:border-l sm:border-t-0">
                <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Categories
                </p>
                {categoryLinks.map((link) => (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => {
                      closeAll();
                      router.push(link.href);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-body hover:text-primary"
                  >
                    <ChevronRightIcon size={12} className="shrink-0 text-muted" />
                    <span className="min-w-0">
                      <span className="block truncate">{link.label}</span>
                      <span className="block truncate text-[11px] text-muted">
                        in {link.parent}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Always last: search exactly what was typed */}
          <button
            type="button"
            onClick={() => goSearch(query)}
            className="flex w-full items-center gap-3 border-t border-line px-4 py-2.5 text-left text-sm font-semibold text-primary hover:bg-primary-light/50"
          >
            <SearchIcon size={14} className="shrink-0" />
            Search for &ldquo;{query.trim()}&rdquo;
          </button>
        </div>
      )}
    </div>
  );
}
