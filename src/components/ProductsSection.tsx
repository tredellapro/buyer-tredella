import Link from "next/link";
import ProductCard from "./ProductCard";
import { retailProducts, wholesaleProducts } from "@/data/products";

type Props = {
  mode: "retail" | "wholesale";
  title: string;
  tagline?: string;
};

export default function ProductsSection({ mode, title, tagline }: Props) {
  const products = (
    mode === "wholesale" ? wholesaleProducts : retailProducts
  ).slice(0, 8);

  return (
    <section className="bg-paper py-8">
      <div className="container mx-auto px-2">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-heading">{title}</h2>
            {tagline && <p className="mt-1 text-sm text-muted">{tagline}</p>}
          </div>
          <Link
            href="#"
            className="text-sm font-medium text-muted hover:text-primary"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} mode={mode} />
          ))}
        </div>
      </div>
    </section>
  );
}
