"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories } from "@/data/categories";
import {
  GridIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CategoryIcon,
} from "./icons";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const prefix = pathname.startsWith("/wholesale") ? "/wholesale" : "";

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setHovered(null);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const hoveredCategory = categories.find((c) => c.slug === hovered);

  const closeMenu = () => {
    setOpen(false);
    setHovered(null);
  };

  return (
    <nav className="relative z-20 bg-white shadow-[0_4px_16px_rgba(43,52,69,0.06)]">
      <div className="container mx-auto px-2 flex h-15 items-center justify-between">
        {/* Categories dropdown */}
        <div ref={wrapperRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex h-10 w-auto items-center gap-2.5 rounded-md bg-paper px-4 text-sm font-semibold text-heading hover:bg-line/60 sm:w-64"
          >
            <GridIcon size={18} className="text-muted" />
            <span className="flex-1 text-left text-muted">Categories</span>
            <ChevronDownIcon
              size={16}
              className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div className="absolute left-0 top-full mt-2 flex items-stretch">
              {/* Category list */}
              <div className="w-70 shrink-0 rounded-md bg-white py-3 shadow-[0_4px_16px_rgba(43,52,69,0.15)]">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`${prefix}/${cat.slug}`}
                    onMouseEnter={() => setHovered(cat.slug)}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 px-5 py-3 text-sm ${
                      hovered === cat.slug
                        ? "bg-primary-light text-primary"
                        : "text-body hover:bg-primary-light hover:text-primary"
                    }`}
                  >
                    <CategoryIcon name={cat.icon} size={19} />
                    <span className="flex-1">{cat.name}</span>
                    {cat.megaMenu && <ChevronRightIcon size={13} />}
                  </Link>
                ))}
              </div>

              {/* Mega menu flyout */}
              {hoveredCategory?.megaMenu && (
                <div
                  onMouseLeave={() => setHovered(null)}
                  className="ml-1 hidden w-2xl grid-cols-4 gap-x-10 gap-y-10 rounded-md bg-white p-8 shadow-[0_4px_16px_rgba(43,52,69,0.15)] lg:grid"
                >
                  {hoveredCategory.megaMenu.map((group, groupIndex) => (
                    <div key={`${group.title}-${groupIndex}`}>
                      <h4 className="mb-4 text-sm font-semibold text-heading">
                        {group.title}
                      </h4>
                      <ul className="space-y-3">
                        {group.items.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={`${prefix}${item.href}`}
                              onClick={closeMenu}
                              className="text-sm text-body hover:text-primary"
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
