"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper/types";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import "swiper/css";
import "swiper/css/navigation";
import ProductCard from "./ProductCard";
import type { Mode, Product } from "@/data/products";

type Props = { products: Product[]; mode: Mode };

/* Horizontal product carousel used for Related Products and any other
   "browse sideways" row. Arrows sit outside the cards on desktop and are
   hidden on touch screens, where swiping is the natural gesture. */
export default function ProductSlider({ products, mode }: Props) {
  const swiperRef = useRef<SwiperClass | null>(null);

  if (products.length === 0) return null;

  const arrowClass =
    "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-heading shadow-[0_4px_16px_rgba(43,52,69,0.15)] transition-colors hover:border-primary hover:bg-primary hover:text-white lg:flex";

  return (
    <div className="product-slider relative">
      {/* Custom arrows sit outside the cards so they never cover product art */}
      <button
        type="button"
        aria-label="Previous products"
        onClick={() => swiperRef.current?.slidePrev()}
        className={`${arrowClass} -left-5`}
      >
        <HiOutlineChevronLeft size={20} />
      </button>
      <button
        type="button"
        aria-label="Next products"
        onClick={() => swiperRef.current?.slideNext()}
        className={`${arrowClass} -right-5`}
      >
        <HiOutlineChevronRight size={20} />
      </button>

      <Swiper
        modules={[Navigation]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        spaceBetween={20}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
        }}
        className="!pb-1"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="h-auto">
            <ProductCard product={product} mode={mode} />
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .product-slider .swiper-slide {
          height: auto;
          display: flex;
        }
        .product-slider .swiper-slide > * {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
