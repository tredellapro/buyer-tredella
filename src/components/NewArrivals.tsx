import Image from "next/image";
import Link from "next/link";
import {
  getProducts,
  priceLabel,
  subcategoryHref,
  type Mode,
} from "@/data/products";

type Props = { mode: Mode };

export default function NewArrivals({ mode }: Props) {
  const prefix = mode === "wholesale" ? "/wholesale" : "";
  // a fresh mix from different subcategories
  const products = getProducts(mode)
    .filter((_, i) => i % 7 === 0 || i % 5 === 0)
    .slice(0, 6);

  return (
    <section className="bg-paper py-8">
      <div className="container mx-auto px-2">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-heading">New Arrivals</h2>
          <Link
            href={`${prefix}/fashion`}
            className="text-sm font-medium text-muted hover:text-primary"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg bg-white p-4 shadow-[0_1px_3px_rgba(43,52,69,0.1)] sm:grid-cols-4 lg:grid-cols-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={subcategoryHref(mode, product.category, product.subcategory)}
              className="group"
            >
              <div className="flex aspect-square items-center justify-center rounded-lg bg-paper p-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={180}
                  height={180}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="mt-2 line-clamp-1 text-sm font-medium text-heading group-hover:text-primary">
                {product.name}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-primary">
                {priceLabel(product, mode)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
