import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 20) => ({
  width: size,
  height: size,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
});

export const SearchIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

export const UserIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const BagIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M6 7h12l1 14H5L6 7Z" />
    <path d="M9 10V6a3 3 0 0 1 6 0v4" />
  </svg>
);

export const ChevronDownIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ChevronRightIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const GridIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </svg>
);

export const TrashIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3" />
  </svg>
);

export const HeartIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12 21C7 17 3 13.5 3 9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 9 2.5c0 4-4 7.5-9 11.5Z" />
  </svg>
);

export const SwapIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M16 3l4 4-4 4M20 7H7M8 21l-4-4 4-4M4 17h13" />
  </svg>
);

/* ---------------- service icons ---------------- */

export const TruckIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M1 5h13v11H1zM14 9h4l3 3v4h-7" />
    <circle cx="5.5" cy="18" r="2" />
    <circle cx="17.5" cy="18" r="2" />
  </svg>
);

export const CreditCardIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20M6 15h4" />
  </svg>
);

export const ShieldIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const HeadsetIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
    <rect x="2" y="13" width="4" height="6" rx="1.5" />
    <rect x="18" y="13" width="4" height="6" rx="1.5" />
    <path d="M20 19a4 4 0 0 1-4 3h-3" />
  </svg>
);

/* ---------------- social icons ---------------- */

export const FacebookIcon = ({ size = 18, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.2-1.5 1.5-1.5h1.4V4.9c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.3v7h3.3Z" />
  </svg>
);

export const InstagramIcon = ({ size = 18, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const TwitterIcon = ({ size = 18, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L2.5 2h6.4l4.4 5.9L18.9 2Zm-1.1 18h1.7L7.9 3.8H6.1L17.8 20Z" />
  </svg>
);

export const YoutubeIcon = ({ size = 18, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M23 12s0-3.8-.5-5.6c-.3-1-1-1.8-2-2C18.7 4 12 4 12 4s-6.7 0-8.5.4c-1 .3-1.7 1-2 2C1 8.2 1 12 1 12s0 3.8.5 5.6c.3 1 1 1.8 2 2 1.8.4 8.5.4 8.5.4s6.7 0 8.5-.4c1-.3 1.7-1 2-2 .5-1.8.5-5.6.5-5.6ZM9.8 15.5v-7l5.8 3.5-5.8 3.5Z" />
  </svg>
);

export const LinkedinIcon = ({ size = 18, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M6.9 21H3.4V8.6h3.5V21ZM5.2 7A2 2 0 1 1 5.2 3a2 2 0 0 1 0 4ZM21 21h-3.5v-6c0-1.4-.5-2.4-1.8-2.4-1 0-1.6.7-1.8 1.3-.1.2-.1.6-.1.9V21H10.3s.1-11.3 0-12.4h3.5v1.8c.5-.7 1.3-1.8 3.2-1.8 2.3 0 4 1.5 4 4.8V21Z" />
  </svg>
);

/* ---------------- category icons ---------------- */

const categoryIcons: Record<string, (p: IconProps) => React.ReactNode> = {
  fashion: (p) => (
    <svg {...base(p.size)} {...p}>
      <path d="M9 4 4 8l2 3 2-1v10h8V10l2 1 2-3-5-4a3 3 0 0 1-6 0Z" />
    </svg>
  ),
  electronics: (p) => (
    <svg {...base(p.size)} {...p}>
      <rect x="3" y="5" width="18" height="12" rx="1.5" />
      <path d="M8 21h8" />
    </svg>
  ),
  bikes: (p) => (
    <svg {...base(p.size)} {...p}>
      <circle cx="6" cy="16" r="3.5" />
      <circle cx="18" cy="16" r="3.5" />
      <path d="M6 16 9 9h6l3 7M9 9 8 6h3" />
    </svg>
  ),
  home: (p) => (
    <svg {...base(p.size)} {...p}>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  ),
  gifts: (p) => (
    <svg {...base(p.size)} {...p}>
      <rect x="4" y="9" width="16" height="12" rx="1" />
      <path d="M4 13h16M12 9v12M12 9c-2 0-4.5-.5-4.5-2.5S10 4 12 9Zm0 0c2 0 4.5-.5 4.5-2.5S14 4 12 9Z" />
    </svg>
  ),
  music: (p) => (
    <svg {...base(p.size)} {...p}>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </svg>
  ),
  health: (p) => (
    <svg {...base(p.size)} {...p}>
      <path d="M12 21C7 17 3 13.5 3 9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 9 2.5c0 4-4 7.5-9 11.5Z" />
    </svg>
  ),
  pets: (p) => (
    <svg {...base(p.size)} {...p}>
      <circle cx="7" cy="8" r="1.8" />
      <circle cx="12" cy="6" r="1.8" />
      <circle cx="17" cy="8" r="1.8" />
      <path d="M12 11c-3 0-5.5 2.5-5.5 5 0 1.5 1 2.5 2.5 2.5 1 0 2-.5 3-.5s2 .5 3 .5c1.5 0 2.5-1 2.5-2.5 0-2.5-2.5-5-5.5-5Z" />
    </svg>
  ),
  baby: (p) => (
    <svg {...base(p.size)} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v4M9 14s1 1.5 3 1.5 3-1.5 3-1.5" />
      <circle cx="9" cy="10" r=".5" fill="currentColor" />
      <circle cx="15" cy="10" r=".5" fill="currentColor" />
    </svg>
  ),
  groceries: (p) => (
    <svg {...base(p.size)} {...p}>
      <path d="M5 7h15l-2 9H7L5 3H3" />
      <circle cx="8" cy="20" r="1.5" />
      <circle cx="16" cy="20" r="1.5" />
    </svg>
  ),
  automotive: (p) => (
    <svg {...base(p.size)} {...p}>
      <path d="M5 12 7 6h10l2 6" />
      <rect x="3" y="12" width="18" height="6" rx="1.5" />
      <circle cx="7.5" cy="18" r="1.5" />
      <circle cx="16.5" cy="18" r="1.5" />
    </svg>
  ),
};

export const CategoryIcon = ({ name, ...p }: IconProps & { name: string }) => {
  const Icon = categoryIcons[name];
  return Icon ? <>{Icon(p)}</> : <GridIcon {...p} />;
};
