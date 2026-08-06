import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import Gallery from "./Gallery";
import BuyBox from "./BuyBox";
import SellerCard from "./SellerCard";
import QASection from "./QASection";
import { gql } from "@/lib/graphql";
import {
  apiMode,
  toCardProduct,
  PRODUCT_CARD_FIELDS,
  type ApiProduct,
  type ApiQuestion,
  type ApiReview,
  type UiMode,
} from "@/lib/types";

type Props = { slug: string; mode: UiMode };

type DetailData = {
  getProduct:
    | (ApiProduct & {
        description: string;
        images: { id: string; url: string }[];
        attributes: { name: string; value: string }[];
        seller: {
          slug: string;
          name: string;
          rating: number;
          verified: boolean;
          positivePercent: number;
          productCount: number;
          shipsFrom: string;
          deliveryEstimate: string;
          freeShippingOver: number | null;
        };
      })
    | null;
};

const Stars = ({ rating, size = 16 }: { rating: number; size?: number }) => (
  <span className="inline-flex items-center gap-0.5 align-middle">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg
        key={i}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={i <= Math.round(rating) ? "fill-amber-400" : "fill-line"}
      >
        <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8-6.1-3.4-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
      </svg>
    ))}
  </span>
);

export default async function ProductDetail({ slug, mode }: Props) {
  const prefix = mode === "wholesale" ? "/wholesale" : "";

  const data = await gql<DetailData>(
    `query GetProduct($slug: String!, $mode: Mode!) {
      getProduct(slug: $slug, mode: $mode) {
        ${PRODUCT_CARD_FIELDS}
        description
        images { id url }
        attributes { name value }
        seller {
          slug name rating verified positivePercent productCount
          shipsFrom deliveryEstimate freeShippingOver
        }
      }
    }`,
    { slug, mode: apiMode(mode) },
    { revalidate: 30 }
  );

  const product = data.getProduct;
  if (!product) notFound();

  const [reviewsData, questionsData, relatedData] = await Promise.all([
    gql<{ getProductReviews: { items: ApiReview[]; average: number; distribution: number[]; pageInfo: { total: number } } }>(
      `query($productId: ID!) {
        getProductReviews(productId: $productId, pageSize: 10) {
          items { id rating text images verified createdAt user { id name avatar } }
          average distribution pageInfo { total }
        }
      }`,
      { productId: product.id },
      { revalidate: 30 }
    ),
    gql<{ getProductQuestions: ApiQuestion[] }>(
      `query($productId: ID!) {
        getProductQuestions(productId: $productId) {
          id text answer answeredAt createdAt user { name }
        }
      }`,
      { productId: product.id },
      { revalidate: 30 }
    ),
    gql<{ getRelatedProducts: ApiProduct[] }>(
      `query($productId: ID!, $mode: Mode!) {
        getRelatedProducts(productId: $productId, mode: $mode) { ${PRODUCT_CARD_FIELDS} }
      }`,
      { productId: product.id, mode: apiMode(mode) },
      { revalidate: 60 }
    ),
  ]);

  const reviews = reviewsData.getProductReviews;
  const questions = questionsData.getProductQuestions;
  const related = relatedData.getRelatedProducts;
  const images = product.images.map((i) => i.url);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images,
    description: product.description,
    sku: product.sku,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : undefined,
    aggregateRating:
      product.reviewsCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewsCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "AED",
      price:
        mode === "wholesale"
          ? (product.wholesaleFrom ?? product.retailPrice)
          : product.retailPrice,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: product.seller.name },
    },
  };

  return (
    <>
      <Header />
      <Navbar />
      <main className="flex-1 bg-paper pb-14 pt-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="container mx-auto px-2">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted">
            <Link href={prefix || "/"} className="hover:text-primary">
              Home
            </Link>{" "}
            /{" "}
            <Link
              href={`${prefix}/${product.category?.slug}`}
              className="hover:text-primary"
            >
              {product.category?.name}
            </Link>{" "}
            /{" "}
            <Link
              href={`${prefix}/${product.category?.slug}/${product.subcategory?.slug}`}
              className="hover:text-primary"
            >
              {product.subcategory?.name}
            </Link>{" "}
            / <span className="text-heading">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Gallery */}
            <div className="lg:col-span-5">
              <Gallery images={images} name={product.name} />
            </div>

            {/* Info + buy box */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-2">
                {mode === "wholesale" && (
                  <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    Wholesale
                  </span>
                )}
                {product.brand && (
                  <span className="text-xs text-muted">
                    Brand: <span className="font-medium text-heading">{product.brand}</span>
                  </span>
                )}
              </div>
              <h1 className="mt-1 text-2xl font-bold text-heading">
                {product.name}
              </h1>
              <p className="mt-1 text-sm text-body">
                <Stars rating={product.rating} />{" "}
                <span className="font-semibold text-heading">
                  {product.rating}
                </span>{" "}
                <span className="text-muted">
                  ({reviews.pageInfo.total} reviews · {product.sold.toLocaleString()} sold)
                </span>
              </p>

              <div className="mt-2 space-y-0.5 text-sm">
                <p className="text-muted">
                  SKU: <span className="text-heading">{product.sku}</span>
                </p>
                <p
                  className={product.inStock ? "text-green-600" : "text-primary"}
                >
                  {product.inStock
                    ? `In stock (${product.stock} available)`
                    : "Out of stock"}
                </p>
              </div>

              <BuyBox product={product} mode={mode} />
            </div>

            {/* Seller + delivery */}
            <div className="space-y-4 lg:col-span-3">
              <SellerCard
                seller={product.seller}
                productId={product.id}
                modePrefix={prefix}
              />

              <div className="rounded-lg bg-white p-5 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
                <h3 className="text-sm font-semibold text-heading">Delivery</h3>
                <div className="mt-2 space-y-1.5 text-sm text-body">
                  <p>
                    Estimated delivery:{" "}
                    <span className="font-medium text-heading">
                      {product.deliveryDays} Business Days
                    </span>
                  </p>
                  <p>
                    Shipping:{" "}
                    <span className="font-medium text-heading">
                      {product.freeShipping
                        ? "Free Shipping"
                        : product.seller.freeShippingOver
                          ? `Free over AED ${product.seller.freeShippingOver}`
                          : "Standard rates apply"}
                    </span>
                  </p>
                  <p>
                    Ships from:{" "}
                    <span className="font-medium text-heading">
                      {product.seller.shipsFrom}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description + Additional information */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
              <h2 className="text-lg font-bold text-heading">Description</h2>
              <p className="mt-3 text-sm leading-relaxed text-body">
                {product.description}
              </p>
            </section>

            <section className="rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
              <h2 className="text-lg font-bold text-heading">
                Additional Information
              </h2>
              <table className="mt-3 w-full text-sm">
                <tbody>
                  {product.attributes.map((attr) => (
                    <tr key={attr.name} className="border-b border-line last:border-0">
                      <td className="py-2 pr-4 font-medium text-heading">
                        {attr.name}
                      </td>
                      <td className="py-2 text-body">{attr.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>

          {/* Reviews + Q&A */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
              <h2 className="text-lg font-bold text-heading">
                Customer Reviews
              </h2>

              {reviews.pageInfo.total > 0 ? (
                <>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-3xl font-bold text-heading">
                      {reviews.average}
                    </span>
                    <div>
                      <Stars rating={reviews.average} />
                      <p className="text-xs text-muted">
                        Based on {reviews.pageInfo.total} reviews
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.distribution[star - 1] ?? 0;
                      const pct = reviews.pageInfo.total
                        ? (count / reviews.pageInfo.total) * 100
                        : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-8 text-muted">{star} ★</span>
                          <div className="h-2 flex-1 rounded-full bg-paper">
                            <div
                              className="h-2 rounded-full bg-amber-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-6 text-right text-muted">{count}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 space-y-5">
                    {reviews.items.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-line pb-4 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <Stars rating={review.rating} size={14} />
                          {review.verified && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-sm text-body">{review.text}</p>
                        <p className="mt-1 text-xs text-muted">
                          {review.user.name} ·{" "}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm text-muted">
                  No reviews yet. Reviews can be written from your orders after
                  delivery is completed.
                </p>
              )}
            </section>

            <QASection productId={product.id} initialQuestions={questions} />
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-5 text-2xl font-bold text-heading">
                Related Products
              </h2>
              <div className="flex gap-5 overflow-x-auto pb-2 [&>*]:w-64 [&>*]:shrink-0">
                {related.map((rp) => (
                  <ProductCard
                    key={rp.id}
                    product={toCardProduct(rp)}
                    mode={mode}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
