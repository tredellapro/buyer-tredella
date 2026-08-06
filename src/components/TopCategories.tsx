import Image from "next/image";
import Link from "next/link";
import { subcategoryHref, type Mode } from "@/data/products";

type Props = { mode: Mode };

const topCategories = [
  {
    name: "Headphone",
    image: "/assets/images/categories/category-1.png",
    orders: "3k orders this week",
    category: "electronics",
    sub: "Audio & Video",
  },
  {
    name: "Watch",
    image: "/assets/images/categories/category-2.png",
    orders: "3k orders this week",
    category: "electronics",
    sub: "Mobiles & Tablets",
  },
  {
    name: "Sunglass",
    image: "/assets/images/categories/category-3.png",
    orders: "2k orders this week",
    category: "fashion",
    sub: "Accessories",
  },
  {
    name: "Headphone",
    image: "/assets/images/categories/category-1.png",
    orders: "3k orders this week",
    category: "electronics",
    sub: "Audio & Video",
  },
];

export default function TopCategories({ mode }: Props) {
  const prefix = mode === "wholesale" ? "/wholesale" : "";

  return (
    <section className="bg-paper py-8">
      <div className="container mx-auto px-2">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-heading">Top Categories</h2>
          <Link
            href={`${prefix}/electronics`}
            className="text-sm font-medium text-muted hover:text-primary"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {topCategories.map((cat, i) => (
            <Link
              key={`${cat.name}-${i}`}
              href={subcategoryHref(mode, cat.category, cat.sub)}
              className="group relative overflow-hidden rounded-lg bg-white shadow-[0_1px_3px_rgba(43,52,69,0.1)] transition-shadow hover:shadow-[0_8px_24px_rgba(43,52,69,0.15)]"
            >
              <span className="absolute left-3 top-3 z-10 rounded-full bg-heading px-3 py-1 text-[11px] font-semibold text-white">
                {cat.name}
              </span>
              <span className="absolute right-3 top-3 z-10 rounded-full bg-heading/70 px-3 py-1 text-[11px] text-white">
                {cat.orders}
              </span>
              <Image
                src={cat.image}
                alt={cat.name}
                width={400}
                height={220}
                className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
