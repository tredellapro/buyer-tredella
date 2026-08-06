import Image from "next/image";
import Link from "next/link";
import {
  getProducts,
  priceLabel,
  subcategoryHref,
  type Mode,
} from "@/data/products";

type Props = { mode: Mode };

const brands = [
  { name: "London Britches", image: "/assets/images/brands/london-britches.png" },
  { name: "Jim & Jago", image: "/assets/images/brands/jim-and-jago.png" },
];

const MiniStars = ({ rating }: { rating: number }) => (
  <span className="flex items-center justify-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg
        key={i}
        width="12"
        height="12"
        viewBox="0 0 24 24"
        className={i <= Math.round(rating) ? "fill-amber-400" : "fill-line"}
      >
        <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8-6.1-3.4-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
      </svg>
    ))}
  </span>
);

export default function TopRatingsBrands({ mode }: Props) {
  const prefix = mode === "wholesale" ? "/wholesale" : "";
  const topRated = [...getProducts(mode)]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <section className="bg-paper py-8">
      <div className="container mx-auto px-2">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Top Ratings */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-heading">Top Ratings</h2>
              <Link
                href={`${prefix}/electronics`}
                className="text-sm font-medium text-muted hover:text-primary"
              >
                View all →
              </Link>
            </div>

            <div className="grid h-full grid-cols-2 content-center gap-4 rounded-lg bg-white p-4 shadow-[0_1px_3px_rgba(43,52,69,0.1)] sm:grid-cols-4">
              {topRated.map((product) => (
                <Link
                  key={product.id}
                  href={subcategoryHref(mode, product.category, product.subcategory)}
                  className="group flex flex-col items-center text-center"
                >
                  <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-paper p-3">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={160}
                      height={160}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-2">
                    <MiniStars rating={product.rating} />
                    <p className="mt-1 line-clamp-1 text-xs font-medium text-heading group-hover:text-primary">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-primary">
                      {priceLabel(product, mode)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Featured Brands */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-heading">
                Featured Brands
              </h2>
              <Link
                href="#"
                className="text-sm font-medium text-muted hover:text-primary"
              >
                View all →
              </Link>
            </div>

            <div className="grid h-full grid-cols-2 gap-4 rounded-lg bg-white p-4 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
              {brands.map((brand) => (
                <Link key={brand.name} href="#" className="group">
                  <div className="overflow-hidden rounded-lg">
                    <Image
                      src={brand.image}
                      alt={brand.name}
                      width={400}
                      height={280}
                      className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-52"
                    />
                  </div>
                  <p className="mt-2 text-sm font-medium text-heading group-hover:text-primary">
                    {brand.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
