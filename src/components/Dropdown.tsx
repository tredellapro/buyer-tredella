"use client";

import { useEffect, useRef, useState } from "react";

export type DropdownOption = { value: string; label: string };

type DropdownProps = {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  /** Names the control for screen readers. */
  label: string;
  align?: "left" | "right";
  className?: string;
};

/**
 * A listbox, not a native `<select>`.
 *
 * The browser draws a native select's popup itself, so it cannot be styled to
 * match the rest of the site. Rendering the list means carrying the keyboard
 * behaviour a native select gives for free: arrows move, Enter and Space
 * select, Escape closes.
 */
export default function Dropdown({
  value,
  options,
  onChange,
  label,
  align = "left",
  className = "",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  /* Opening seeds the highlight from the current selection. Done here rather
     than in an effect: an effect would set state during the render that just
     opened the menu, costing a second pass for something already known. */
  const openMenu = () => {
    setHighlighted(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const commit = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        openMenu();
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((index) => Math.min(options.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      commit(highlighted);
    }
  };

  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className="flex w-full items-center justify-between gap-1.5 text-sm text-heading"
      >
        <span className="truncate">{selected?.label ?? "Select"}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="M5.5 7.5 10 12l4.5-4.5H5.5Z" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          className={`absolute z-30 mt-2 max-h-60 min-w-40 overflow-y-auto rounded-xl border border-line bg-white p-1 shadow-[0_12px_32px_rgba(43,52,69,0.16)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => commit(index)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  index === highlighted
                    ? "bg-primary-light text-primary"
                    : "text-heading"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3.5 w-3.5 shrink-0 text-primary"
                  >
                    <path d="M7.6 13.5 4.3 10.2l1.1-1.1 2.2 2.2 6-6 1.1 1.1z" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
