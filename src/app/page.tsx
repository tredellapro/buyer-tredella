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

export default function Home() {
  return (
    <>
      <Header />
      <Navbar />
      <main className="flex-1">
        <h1 className="sr-only">
          Tredella — Retail &amp; Wholesale Marketplace in the Gulf
        </h1>
        <HeroSection />
        <FeaturedCategories mode="retail" />
        <ProductsSection
          mode="retail"
          title="Flash Deals"
          tagline="Best prices on top products — updated daily"
        />
        <TopCategories mode="retail" />
        <TopRatingsBrands mode="retail" />
        <NewArrivals mode="retail" />
        <BigDiscounts mode="retail" />
        <CategoryTabsSection mode="retail" category="electronics" title="Electronics" />
        <CategoryTabsSection mode="retail" category="fashion" title="Fashion" />
        <ServicesStrip />
      </main>
    </>
  );
}
