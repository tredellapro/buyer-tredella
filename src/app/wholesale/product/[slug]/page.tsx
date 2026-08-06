import type { Metadata } from "next";
import ProductDetail from "@/components/product/ProductDetail";
import { gql } from "@/lib/graphql";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await gql<{
      getProduct: { name: string; description: string; image: string } | null;
    }>(
      `query($slug: String!) {
        getProduct(slug: $slug, mode: WHOLESALE) { name description image }
      }`,
      { slug },
      { revalidate: 300 }
    );
    if (!data.getProduct) return { title: "Product not found" };
    return {
      title: `${data.getProduct.name} — Wholesale`,
      description: data.getProduct.description.slice(0, 160),
      alternates: { canonical: `/wholesale/product/${slug}` },
    };
  } catch {
    return { title: "Product — Wholesale" };
  }
}

export default async function WholesaleProductPage({ params }: Props) {
  const { slug } = await params;
  return <ProductDetail slug={slug} mode="wholesale" />;
}
