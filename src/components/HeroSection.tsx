"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Slide = {
  image: string;
  title: string;
  category: string;
  discount: number;
  description: string;
  buttonText: string;
};

const slides: Slide[] = [
  {
    image: "/assets/images/banners/banner-15.jpg",
    title: "Lifestyle collection",
    category: "Men",
    discount: 30,
    description: "Get Free Shipping on orders over AED 350",
    buttonText: "Shop Now",
  },
  {
    image: "/assets/images/banners/banner-25.jpg",
    title: "Wholesale deals",
    category: "Bulk Buy",
    discount: 40,
    description: "Order in bulk and save more on every unit",
    buttonText: "Buy Wholesale",
  },
];

const sideBanners = [
  {
    image: "/assets/images/banners/banner-17.jpg",
    tagline: "NEW ARRIVALS",
    title: ["SUMMER", "SALE 20% OFF"],
  },
  {
    image: "/assets/images/banners/banner-16.jpg",
    tagline: "GAMING 4K",
    title: ["DESKTOPS &", "LAPTOPS"],
  },
];

export default function HeroSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setActive((prev) => (prev + 1) % slides.length),
      5000
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-paper pb-10 pt-6">
      <div className="container mx-auto px-2">
        <div className="grid grid-cols-12 gap-5">
          {/* Carousel */}
          <div className="relative col-span-12 overflow-hidden rounded lg:col-span-9">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${active * 100}%)` }}
            >
              {slides.map((slide) => (
                <div
                  key={slide.category}
                  className="flex min-h-[400px] w-full shrink-0 items-center bg-white bg-cover bg-center md:min-h-[500px]"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="px-6 text-center sm:px-20 sm:text-left">
                    <p className="mb-1 text-2xl font-normal uppercase text-heading md:text-3xl">
                      {slide.title}
                    </p>
                    <p className="text-5xl font-bold uppercase leading-none text-heading md:text-6xl">
                      {slide.category}
                    </p>
                    <p className="mt-3 text-2xl font-semibold uppercase text-heading md:text-3xl">
                      Sale up to{" "}
                      <span className="text-primary">{slide.discount}% off</span>
                    </p>
                    <p className="mt-2 mb-8 text-base text-body md:text-lg">
                      {slide.description}
                    </p>
                    <Link
                      href="#"
                      className="inline-block rounded bg-primary px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                    >
                      {slide.buttonText}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.category}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={`h-3 w-3 rounded-full border transition-colors ${
                    i === active
                      ? "border-primary bg-primary [box-shadow:inset_0_0_0_2px_#fff]"
                      : "border-primary bg-transparent"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Side banners */}
          <div className="col-span-12 flex flex-col gap-5 sm:flex-row lg:col-span-3 lg:flex-col">
            {sideBanners.map((banner) => (
              <div
                key={banner.tagline}
                className="flex min-h-[240px] flex-1 flex-col justify-center rounded bg-cover bg-center p-6"
                style={{ backgroundImage: `url(${banner.image})` }}
              >
                <p className="text-[13px] tracking-widest text-body">
                  {banner.tagline}
                </p>
                <h4 className="mb-2 text-xl font-semibold leading-tight text-heading">
                  {banner.title[0]}
                  <br />
                  {banner.title[1]}
                </h4>
                <Link
                  href="#"
                  className="w-fit text-sm font-medium text-heading underline-offset-4 hover:text-primary hover:underline"
                >
                  Shop Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
