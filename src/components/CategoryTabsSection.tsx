"use client";

import { useState } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import {
  getProductsBySubcategory,
  getSubcategories,
  subcategoryHref,
  type Mode,
} from "@/data/products";

type Props = {
  mode: Mode;
  category: string; // category slug
  title: string;
};

/* Category section with subcategory TABS — shows 6 products per tab,
   "View all" opens the subcategory listing page. */
export default function CategoryTabsSection({ mode, category, title }: Props) {
  const subcategories = getSubcategories(category);
  const [activeTab, setActiveTab] = useState(subcategories[0]);

  const products = getProductsBySubcategory(mode, category, activeTab).slice(0, 8);
  const viewAllHref = subcategoryHref(mode, category, activeTab);

  return (
    <section className="bg-paper py-8">
      <div className="container mx-auto px-2">
        {/* Heading + tabs */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-heading">{title}</h2>

          <div className="flex flex-wrap items-center gap-2">
            {subcategories.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setActiveTab(sub)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === sub
                    ? "bg-primary text-white"
                    : "bg-white text-body shadow-[0_1px_3px_rgba(43,52,69,0.1)] hover:text-primary"
                }`}
              >
                {sub}
              </button>
            ))}

            <Link
              href={viewAllHref}
              className="ml-2 text-sm font-medium text-muted hover:text-primary"
            >
              View all →
            </Link>
          </div>
        </div>

        {/* 6 products of the active subcategory */}
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} mode={mode} />
          ))}
        </div>
      </div>
    </section>
  );
}
