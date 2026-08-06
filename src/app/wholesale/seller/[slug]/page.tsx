import type { Metadata } from "next";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import SellerStore from "@/components/SellerStore";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: "Wholesale Store",
    alternates: { canonical: `/wholesale/seller/${slug}` },
  };
}

export default async function WholesaleSellerPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort, page } = await searchParams;
  return (
    <>
      <Header />
      <Navbar />
      <SellerStore
        slug={slug}
        mode="wholesale"
        sort={sort}
        page={page ? parseInt(page) : 1}
      />
    </>
  );
}
