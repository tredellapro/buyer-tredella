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
    title: `Wholesale ${name} — Bulk Prices`,
    description: `Buy ${name} in bulk at quantity-based wholesale prices in AED. The more you order, the less you pay per unit — on Tredella.`,
    alternates: { canonical: `/wholesale/${category}` },
  };
}

export default async function WholesaleCategoryPage({ params }: Props) {
  const { category } = await params;
  if (!categories.some((c) => c.slug === category)) notFound();

  return (
    <>
      <Header />
      <Navbar />
      <CategoryListing mode="wholesale" category={category} />
    </>
  );
}
