"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, FreeMode } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper/types";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineMagnifyingGlassPlus,
  HiXMark,
} from "react-icons/hi2";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/free-mode";

type Props = { images: string[]; name: string };

/* Product gallery: a swipeable main image with a synced thumbnail strip,
   hover-to-zoom on desktop, and a full-screen lightbox. */
export default function Gallery({ images, name }: Props) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [mainSwiper, setMainSwiper] = useState<SwiperClass | null>(null);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  const arrowClass =
    "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-heading shadow-[0_2px_8px_rgba(43,52,69,0.18)] transition-colors hover:bg-primary hover:text-white";

  return (
    <div>
      {/* Main image */}
      <div className="group relative overflow-hidden rounded-lg bg-white shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => mainSwiper?.slidePrev()}
              className={`${arrowClass} left-3 opacity-0 group-hover:opacity-100`}
            >
              <HiOutlineChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => mainSwiper?.slideNext()}
              className={`${arrowClass} right-3 opacity-0 group-hover:opacity-100`}
            >
              <HiOutlineChevronRight size={18} />
            </button>
          </>
        )}

        <button
          type="button"
          aria-label="Open full screen"
          onClick={() => setLightbox(true)}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-heading opacity-0 shadow-[0_2px_8px_rgba(43,52,69,0.18)] transition-colors hover:bg-primary hover:text-white group-hover:opacity-100"
        >
          <HiOutlineMagnifyingGlassPlus size={18} />
        </button>

        <span className="absolute bottom-3 left-3 z-10 rounded-full bg-heading/70 px-2.5 py-1 text-[11px] font-medium text-white">
          {active + 1} / {images.length}
        </span>

        <Swiper
          modules={[Navigation, Thumbs]}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          onSwiper={setMainSwiper}
          onSlideChange={(s) => setActive(s.activeIndex)}
          spaceBetween={0}
          slidesPerView={1}
        >
          {images.map((src, i) => (
            <SwiperSlide key={`${src}-${i}`}>
              <div
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setZoom({
                    x: ((e.clientX - r.left) / r.width) * 100,
                    y: ((e.clientY - r.top) / r.height) * 100,
                  });
                }}
                onMouseLeave={() => setZoom(null)}
                className="flex aspect-square items-center justify-center overflow-hidden p-6"
              >
                <Image
                  src={src}
                  alt={`${name} — image ${i + 1}`}
                  width={600}
                  height={600}
                  priority={i === 0}
                  className="h-full w-full object-contain transition-transform duration-200"
                  style={
                    zoom && i === active
                      ? {
                          transform: "scale(1.8)",
                          transformOrigin: `${zoom.x}% ${zoom.y}%`,
                        }
                      : undefined
                  }
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="gallery-thumbs mt-3">
          <Swiper
            modules={[Thumbs, FreeMode]}
            onSwiper={setThumbsSwiper}
            watchSlidesProgress
            freeMode
            spaceBetween={10}
            slidesPerView={4}
            breakpoints={{ 480: { slidesPerView: 5 }, 1024: { slidesPerView: 5 } }}
          >
            {images.map((src, i) => (
              <SwiperSlide key={`thumb-${src}-${i}`}>
                <button
                  type="button"
                  aria-label={`Show image ${i + 1}`}
                  onClick={() => mainSwiper?.slideTo(i)}
                  className={`flex aspect-square w-full items-center justify-center rounded-md border-2 bg-white p-2 transition-colors ${
                    i === active
                      ? "border-primary"
                      : "border-line hover:border-muted"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    width={80}
                    height={80}
                    className="h-full w-full object-contain"
                  />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-heading/85 p-4"
          onClick={() => setLightbox(false)}
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            <HiXMark size={22} />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-3xl flex-col items-center gap-4"
          >
            <Image
              src={images[active]}
              alt={`${name} — image ${active + 1}`}
              width={1000}
              height={1000}
              className="max-h-[75vh] w-auto rounded-lg bg-white object-contain p-4"
            />

            {images.length > 1 && (
              <div className="flex items-center gap-2">
                {images.map((src, i) => (
                  <button
                    key={`lb-${src}-${i}`}
                    type="button"
                    aria-label={`Show image ${i + 1}`}
                    onClick={() => {
                      setActive(i);
                      mainSwiper?.slideTo(i);
                    }}
                    className={`h-14 w-14 overflow-hidden rounded-md border-2 bg-white p-1 ${
                      i === active ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={src}
                      alt=""
                      width={56}
                      height={56}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
