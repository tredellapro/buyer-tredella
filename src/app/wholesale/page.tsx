import type { Metadata } from "next";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedCategories from "@/components/FeaturedCategories";
import ProductsSection from "@/components/ProductsSection";
import TopCategories from "@/components/TopCategories";
import TopRatingsBrands from "@/components/TopRatingsBrands";
import NewArrivals from "@/components/NewArrivals";
import BigDiscounts from "@/components/BigDiscounts";
import CategoryTabsSection from "@/components/CategoryTabsSection";
import ServicesStrip from "@/components/ServicesStrip";

export const metadata: Metadata = {
  title: "Wholesale — Bulk Prices in AED",
  description:
    "Buy in bulk at quantity-based wholesale prices in AED. The more you order, the less you pay per unit.",
  alternates: { canonical: "/wholesale" },
};

/* Same design as the retail homepage — only the products (and their
   quantity-tier pricing) differ. */
export default function WholesalePage() {
  return (
    <>
      <Header />
      <Navbar />
      <main className="flex-1">
        <h1 className="sr-only">
          Wholesale Products — Quantity-based Bulk Prices in AED
        </h1>
        <HeroSection />
        <FeaturedCategories mode="wholesale" />
        <ProductsSection
          mode="wholesale"
          title="Wholesale Deals"
          tagline="Quantity-based pricing — the more you order, the less you pay per unit"
        />
        <TopCategories mode="wholesale" />
        <TopRatingsBrands mode="wholesale" />
        <NewArrivals mode="wholesale" />
        <BigDiscounts mode="wholesale" />
        <CategoryTabsSection mode="wholesale" category="electronics" title="Electronics" />
        <CategoryTabsSection mode="wholesale" category="fashion" title="Fashion" />
        <ServicesStrip />
      </main>
    </>
  );
}
