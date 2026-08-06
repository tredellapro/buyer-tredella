import Image from "next/image";
import Link from "next/link";
import {
  formatAED,
  getProducts,
  priceLabel,
  subcategoryHref,
  type Mode,
} from "@/data/products";

type Props = { mode: Mode };

export default function BigDiscounts({ mode }: Props) {
  const prefix = mode === "wholesale" ? "/wholesale" : "";
  // electronics with the biggest visual discount
  const products = getProducts(mode)
    .filter((p) => p.category === "electronics")
    .slice(6, 14);

  return (
    <section className="bg-paper py-8">
      <div className="container mx-auto px-2">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-heading">Big Discounts</h2>
          <Link
            href={`${prefix}/electronics`}
            className="text-sm font-medium text-muted hover:text-primary"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {products.map((product) => (
            <Link
              key={product.id}
              href={subcategoryHref(mode, product.category, product.subcategory)}
              className="group rounded-lg bg-white p-3 shadow-[0_1px_3px_rgba(43,52,69,0.1)] transition-shadow hover:shadow-[0_8px_24px_rgba(43,52,69,0.15)]"
            >
              <div className="flex aspect-square items-center justify-center rounded-lg bg-paper p-3">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={140}
                  height={140}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="mt-2 line-clamp-1 text-xs font-medium text-heading group-hover:text-primary">
                {product.name}
              </p>
              <p className="mt-0.5 text-xs">
                <span className="font-semibold text-primary">
                  {priceLabel(product, mode)}
                </span>{" "}
                {mode === "retail" && product.oldPrice && (
                  <span className="text-muted line-through">
                    {formatAED(product.oldPrice)}
                  </span>
                )}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
