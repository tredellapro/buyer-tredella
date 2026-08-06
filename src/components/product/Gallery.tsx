"use client";

import { useState } from "react";
import Image from "next/image";

type Props = { images: string[]; name: string };

export default function Gallery({ images, name }: Props) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  return (
    <div>
      <button
        type="button"
        aria-label={zoomed ? "Zoom out" : "Zoom in"}
        onClick={() => setZoomed(!zoomed)}
        className="block w-full cursor-zoom-in overflow-hidden rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(43,52,69,0.1)]"
      >
        <div className="flex aspect-square items-center justify-center overflow-hidden">
          <Image
            src={images[active]}
            alt={name}
            width={600}
            height={600}
            priority
            className={`h-full w-full object-contain transition-transform duration-300 ${
              zoomed ? "scale-150 cursor-zoom-out" : ""
            }`}
          />
        </div>
      </button>

      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => {
                setActive(i);
                setZoomed(false);
              }}
              className={`flex h-18 w-18 shrink-0 items-center justify-center rounded-md border bg-white p-2 ${
                i === active ? "border-primary" : "border-line hover:border-muted"
              }`}
            >
              <Image
                src={img}
                alt={`${name} ${i + 1}`}
                width={64}
                height={64}
                className="h-full w-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
