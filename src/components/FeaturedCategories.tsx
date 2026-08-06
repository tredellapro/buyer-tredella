import Image from "next/image";
import Link from "next/link";
import { subcategoryHref, type Mode } from "@/data/products";

type Props = { mode: Mode };

const featured = [
  {
    name: "Camera",
    image: "/assets/images/categories/camera.png",
    sub: "Cameras & Drones",
    big: true,
  },
  {
    name: "Gaming",
    image: "/assets/images/categories/gaming.png",
    sub: "Audio & Video",
  },
  {
    name: "Watch",
    image: "/assets/images/categories/watch.png",
    sub: "Mobiles & Tablets",
  },
  {
    name: "Drone",
    image: "/assets/images/categories/drone.png",
    sub: "Cameras & Drones",
  },
  {
    name: "Phone",
    image: "/assets/images/categories/phone.png",
    sub: "Mobiles & Tablets",
  },
];

export default function FeaturedCategories({ mode }: Props) {
  return (
    <section className="bg-paper py-8">
      <div className="container mx-auto px-2">
        <h2 className="mb-6 text-2xl font-bold text-heading">
          Featured Categories
        </h2>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {featured.map((cat) => (
            <Link
              key={cat.name}
              href={subcategoryHref(mode, "electronics", cat.sub)}
              className={`group flex flex-col justify-between rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(43,52,69,0.1)] transition-shadow hover:shadow-[0_8px_24px_rgba(43,52,69,0.15)] ${
                cat.big ? "col-span-2 row-span-2" : ""
              }`}
            >
              <div
                className={`flex flex-1 items-center justify-center ${
                  cat.big ? "p-6" : "p-2"
                }`}
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  width={cat.big ? 480 : 200}
                  height={cat.big ? 480 : 200}
                  className={`w-full object-contain transition-transform duration-300 group-hover:scale-105 ${
                    cat.big ? "max-h-105" : "max-h-40"
                  }`}
                />
              </div>
              <span className="mt-4 text-sm font-semibold uppercase tracking-wide text-heading group-hover:text-primary">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
