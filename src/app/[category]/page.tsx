import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import CategoryListing from "@/components/CategoryListing";
import { categories } from "@/data/categories";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const name = categories.find((c) => c.slug === category)?.name ?? category;

  return {
    title: `${name} — Shop Online`,
    description: `Buy ${name} online at the best retail prices in AED. Fast delivery across the Gulf on Tredella.`,
    alternates: { canonical: `/${category}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  if (!categories.some((c) => c.slug === category)) notFound();

  return (
    <>
      <Header />
      <Navbar />
      <CategoryListing mode="retail" category={category} />
    </>
  );
}
