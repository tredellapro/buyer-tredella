import type { Metadata } from "next";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import SellerStore from "@/components/SellerStore";
import { gql } from "@/lib/graphql";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await gql<{ getSeller: { name: string; description: string | null } | null }>(
      `query($slug: String!) { getSeller(slug: $slug) { name description } }`,
      { slug },
      { revalidate: 300 }
    );
    if (!data.getSeller) return { title: "Store not found" };
    return {
      title: `${data.getSeller.name} — Official Store`,
      description:
        data.getSeller.description ??
        `Shop products from ${data.getSeller.name} on Tredella.`,
      alternates: { canonical: `/seller/${slug}` },
    };
  } catch {
    return { title: "Seller Store" };
  }
}

export default async function SellerPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort, page } = await searchParams;
  return (
    <>
      <Header />
      <Navbar />
      <SellerStore
        slug={slug}
        mode="retail"
        sort={sort}
        page={page ? parseInt(page) : 1}
      />
    </>
  );
}
