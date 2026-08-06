export type MegaMenuGroup = {
  title: string;
  items: { name: string; href: string }[];
};

export type Category = {
  name: string;
  slug: string;
  icon: string;
  megaMenu?: MegaMenuGroup[];
};

/* Mega-menu items open clean subcategory-style URLs like /fashion/shirt —
   the [category]/[sub] route resolves them to matching products. */
const itemSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const item = (category: string, name: string) => ({
  name,
  href: `/${category}/${itemSlug(name)}`,
});

const fashionGroups = (prefix: string): MegaMenuGroup[] => [
  {
    title: `${prefix} Clothes`,
    items: [
      item("fashion", "Shirt"),
      item("fashion", "Sweater"),
      item("fashion", "Pants"),
      item("fashion", "Jacket"),
    ],
  },
  {
    title: "Accessories",
    items: [
      item("fashion", "Watches"),
      item("fashion", "Sunglasses"),
      item("fashion", "Cap"),
      item("fashion", "Eyeglasses"),
    ],
  },
  {
    title: "Shoes",
    items: [
      item("fashion", "Sneakers"),
      item("fashion", "Nike"),
      item("fashion", "Adidas"),
      item("fashion", "Puma"),
    ],
  },
  {
    title: "Bags",
    items: [
      item("fashion", "Backpack"),
      item("fashion", "Crossbody Bags"),
      item("fashion", "Side Bags"),
      item("fashion", "Slides"),
    ],
  },
];

export const categories: Category[] = [
  {
    name: "Fashion",
    slug: "fashion",
    icon: "fashion",
    megaMenu: [...fashionGroups("Man"), ...fashionGroups("Woman")],
  },
  {
    name: "Electronics",
    slug: "electronics",
    icon: "electronics",
    megaMenu: [
      {
        title: "Mobiles & Tablets",
        items: [
          item("electronics", "Smartphones"),
          item("electronics", "iPhone"),
          item("electronics", "Smart Watches"),
          item("electronics", "Mi Band"),
        ],
      },
      {
        title: "Audio & Video",
        items: [
          item("electronics", "Headphones"),
          item("electronics", "Earphones"),
          item("electronics", "Speakers"),
          item("electronics", "Smart TVs"),
        ],
      },
      {
        title: "Cameras & Drones",
        items: [
          item("electronics", "Cameras"),
          item("electronics", "Drones"),
          item("electronics", "Action Cams"),
          item("electronics", "CCTV"),
        ],
      },
      {
        title: "Appliances",
        items: [
          item("electronics", "Washing Machines"),
          item("electronics", "Microwaves"),
          item("electronics", "Blenders"),
          item("electronics", "Routers"),
        ],
      },
    ],
  },
  { name: "Bikes", slug: "bikes", icon: "bikes" },
  { name: "Home & Garden", slug: "home-garden", icon: "home" },
  { name: "Gifts", slug: "gifts", icon: "gifts" },
  { name: "Music", slug: "music", icon: "music" },
  { name: "Health & Beauty", slug: "health-beauty", icon: "health" },
  { name: "Pets", slug: "pets", icon: "pets" },
  { name: "Baby Toys", slug: "baby-toys", icon: "baby" },
  { name: "Groceries", slug: "groceries", icon: "groceries" },
  { name: "Automotive", slug: "automotive", icon: "automotive" },
];

export const searchCategories = [
  "All Categories",
  ...categories.map((c) => c.name),
];

/** Resolve a mega-menu item slug (e.g. "shirt") back to its display name. */
export const megaMenuItemName = (categorySlug: string, slug: string) => {
  const category = categories.find((c) => c.slug === categorySlug);
  for (const group of category?.megaMenu ?? []) {
    const match = group.items.find((i) => itemSlug(i.name) === slug);
    if (match) return match.name;
  }
  return undefined;
};
