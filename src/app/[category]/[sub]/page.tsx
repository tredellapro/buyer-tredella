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
    title: `${subName} — ${categoryName}`,
    description: `Buy ${subName} online at the best retail prices in AED. Fast delivery across the Gulf on Tredella.`,
    alternates: { canonical: `/${category}/${sub}` },
  };
}

export default async function SubcategoryPage({ params }: Props) {
  const { category, sub } = await params;
  if (!categories.some((c) => c.slug === category)) notFound();

  // real subcategory (e.g. /electronics/mobiles-tablets) …
  const subName = subcategoryNameFromSlug(category, sub);
  if (subName) {
    return (
      <>
        <Header />
        <Navbar />
        <CategoryListing mode="retail" category={category} subcategory={subName} />
      </>
    );
  }

  // … or a mega-menu item (e.g. /fashion/shirt) shown as a filtered listing
  const itemName = megaMenuItemName(category, sub);
  if (!itemName) notFound();

  return (
    <>
      <Header />
      <Navbar />
      <CategoryListing mode="retail" category={category} searchTerm={itemName} />
    </>
  );
}
