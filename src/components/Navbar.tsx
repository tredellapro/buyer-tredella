"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories } from "@/data/categories";
import ModeSwitch from "./ModeSwitch";
import {
  GridIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CategoryIcon,
} from "./icons";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  /* Mobile uses an accordion instead of a hover flyout: tapping a category
     with a mega menu expands its links in place rather than navigating away. */
  const [expanded, setExpanded] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const prefix = pathname.startsWith("/wholesale") ? "/wholesale" : "";

  const closeMenu = () => {
    setOpen(false);
    setHovered(null);
    setExpanded(null);
  };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) closeMenu();
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // close the menu whenever navigation happens
  useEffect(closeMenu, [pathname]);

  const hoveredCategory = categories.find((c) => c.slug === hovered);

  return (
    <nav className="relative z-20 bg-white shadow-[0_4px_16px_rgba(43,52,69,0.06)]">
      <div className="container mx-auto flex h-15 items-center justify-between px-2">
        <div ref={wrapperRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
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
            <>
              {/* ---------- Desktop: list + hover flyout ---------- */}
              <div className="absolute left-0 top-full mt-2 hidden items-stretch lg:flex">
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

                {hoveredCategory?.megaMenu && (
                  <div
                    onMouseLeave={() => setHovered(null)}
                    className="ml-1 grid w-2xl grid-cols-4 gap-x-10 gap-y-10 rounded-md bg-white p-8 shadow-[0_4px_16px_rgba(43,52,69,0.15)]"
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

              {/* ---------- Mobile / tablet: accordion ---------- */}
              <div className="absolute left-0 top-full z-30 mt-2 max-h-[70vh] w-[calc(100vw-1.5rem)] max-w-sm overflow-y-auto rounded-md bg-white py-2 shadow-[0_4px_16px_rgba(43,52,69,0.15)] lg:hidden">
                {categories.map((cat) => {
                  const isExpanded = expanded === cat.slug;
                  return (
                    <div key={cat.slug} className="border-b border-line last:border-0">
                      {/* The name navigates; the empty space beside it (and the
                          chevron) expands the subcategories in place. */}
                      <div className="flex items-center">
                        <Link
                          href={`${prefix}/${cat.slug}`}
                          onClick={closeMenu}
                          className={`flex shrink-0 items-center gap-3 py-3 pl-4 pr-2 text-sm ${
                            isExpanded ? "text-primary" : "text-body"
                          }`}
                        >
                          <CategoryIcon name={cat.icon} size={19} />
                          {cat.name}
                        </Link>

                        {cat.megaMenu ? (
                          <button
                            type="button"
                            aria-label={`${isExpanded ? "Hide" : "Show"} ${cat.name} subcategories`}
                            aria-expanded={isExpanded}
                            onClick={() => setExpanded(isExpanded ? null : cat.slug)}
                            className="flex flex-1 items-center justify-end self-stretch pr-4 text-muted hover:text-primary"
                          >
                            <ChevronDownIcon
                              size={16}
                              className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </button>
                        ) : (
                          <Link
                            href={`${prefix}/${cat.slug}`}
                            onClick={closeMenu}
                            aria-hidden
                            tabIndex={-1}
                            className="flex-1 self-stretch"
                          />
                        )}
                      </div>

                      {isExpanded && cat.megaMenu && (
                        <div className="bg-paper/60 px-4 pb-3 pt-1">
                          {cat.megaMenu.map((group, groupIndex) => (
                            <div
                              key={`${group.title}-${groupIndex}`}
                              className="mb-3 last:mb-0"
                            >
                              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                                {group.title}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {group.items.map((item) => (
                                  <Link
                                    key={item.name}
                                    href={`${prefix}${item.href}`}
                                    onClick={closeMenu}
                                    className="rounded-full bg-white px-3 py-1.5 text-xs text-body shadow-[0_1px_3px_rgba(43,52,69,0.1)] hover:text-primary"
                                  >
                                    {item.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}

                          <Link
                            href={`${prefix}/${cat.slug}`}
                            onClick={closeMenu}
                            className="mt-1 inline-block text-xs font-semibold text-primary hover:underline"
                          >
                            View all {cat.name} →
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Mode switch sits here on mobile, where the header row is full */}
        <ModeSwitch className="md:hidden" />
      </div>
    </nav>
  );
}
