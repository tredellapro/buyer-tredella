import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import CategoryListing from "@/components/CategoryListing";
import { categories, megaMenuItemName } from "@/data/categories";
import { subcategoryNameFromSlug } from "@/data/products";

type Props = { params: Promise<{ category: string; sub: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, sub } = await params;
  const categoryName =
    categories.find((c) => c.slug === category)?.name ?? category;
  const subName =
    subcategoryNameFromSlug(category, sub) ??
    megaMenuItemName(category, sub) ??
    sub;

  return {
    title: `Wholesale ${subName} — ${categoryName}`,
    description: `Buy ${subName} in bulk at quantity-based wholesale prices in AED on Tredella.`,
    alternates: { canonical: `/wholesale/${category}/${sub}` },
  };
}

export default async function WholesaleSubcategoryPage({ params }: Props) {
  const { category, sub } = await params;
  if (!categories.some((c) => c.slug === category)) notFound();

  const subName = subcategoryNameFromSlug(category, sub);
  if (subName) {
    return (
      <>
        <Header />
        <Navbar />
        <CategoryListing
          mode="wholesale"
          category={category}
          subcategory={subName}
        />
      </>
    );
  }

  const itemName = megaMenuItemName(category, sub);
  if (!itemName) notFound();

  return (
    <>
      <Header />
      <Navbar />
      <CategoryListing
        mode="wholesale"
        category={category}
        searchTerm={itemName}
      />
    </>
  );
}
