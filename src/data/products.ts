/* Catalog shared by retail & wholesale — same products/categories/subcategories,
   only pricing differs. Retail = single AED price; wholesale = Alibaba-style
   quantity-tier pricing generated from the same base price. */

export type PriceTier = {
  minQty: number;
  maxQty: number | null; // null = "and above"
  price: number; // AED per unit
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  image: string;
  category: string; // category slug (matches categories.ts)
  subcategory: string;
  rating: number;
  reviews: number;
  // retail
  price?: number; // AED
  oldPrice?: number; // AED
  // wholesale
  priceTiers?: PriceTier[];
  minOrder?: number;
  sold?: number;
};

export const formatAED = (value: number) =>
  `AED ${value.toLocaleString("en-AE", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

/* ---------------- base catalog ---------------- */

type CatalogItem = {
  name: string;
  image: number; // product-N.png
  category: string;
  subcategory: string;
  basePrice: number; // AED retail price
  rating: number;
  reviews: number;
  sold: number;
  minOrder: number;
};

const catalog: CatalogItem[] = [
  /* Electronics — Mobiles & Wearables */
  { name: "Vivo V21 Smartphone", image: 9, category: "electronics", subcategory: "Mobiles & Tablets", basePrice: 899, rating: 4.4, reviews: 182, sold: 7400, minOrder: 10 },
  { name: "Nokia Android One", image: 10, category: "electronics", subcategory: "Mobiles & Tablets", basePrice: 549, rating: 4.2, reviews: 96, sold: 5100, minOrder: 10 },
  { name: "HTC Desire 2018", image: 11, category: "electronics", subcategory: "Mobiles & Tablets", basePrice: 620, rating: 4.1, reviews: 74, sold: 3900, minOrder: 10 },
  { name: "iPhone 7 Classic", image: 33, category: "electronics", subcategory: "Mobiles & Tablets", basePrice: 1150, rating: 4.6, reviews: 411, sold: 12800, minOrder: 5 },
  { name: "Smart Watch Series Pro", image: 4, category: "electronics", subcategory: "Mobiles & Tablets", basePrice: 475, rating: 4.6, reviews: 389, sold: 15700, minOrder: 10 },
  { name: "Xiaomi Mi Band 2", image: 34, category: "electronics", subcategory: "Mobiles & Tablets", basePrice: 145, rating: 4.3, reviews: 528, sold: 24500, minOrder: 20 },
  { name: "Rangs Smartphone 2020", image: 49, category: "electronics", subcategory: "Mobiles & Tablets", basePrice: 460, rating: 4.0, reviews: 63, sold: 2800, minOrder: 10 },
  { name: "Symphony Z Lite", image: 50, category: "electronics", subcategory: "Mobiles & Tablets", basePrice: 380, rating: 4.1, reviews: 87, sold: 4100, minOrder: 10 },

  /* Electronics — Audio & Video */
  { name: "Beats W3 Wireless Headphones", image: 15, category: "electronics", subcategory: "Audio & Video", basePrice: 720, rating: 4.7, reviews: 344, sold: 9200, minOrder: 10 },
  { name: "Beats Wireless Earphones", image: 16, category: "electronics", subcategory: "Audio & Video", basePrice: 410, rating: 4.5, reviews: 218, sold: 11300, minOrder: 15 },
  { name: "Smart Voice Assistant Speaker", image: 1, category: "electronics", subcategory: "Audio & Video", basePrice: 147, rating: 4.5, reviews: 214, sold: 12400, minOrder: 10 },
  { name: "Sony 4K Smart TV 55\"", image: 14, category: "electronics", subcategory: "Audio & Video", basePrice: 2350, rating: 4.8, reviews: 167, sold: 2100, minOrder: 2 },
  { name: "Gaming Console Controller Bundle", image: 2, category: "electronics", subcategory: "Audio & Video", basePrice: 915, rating: 4.8, reviews: 452, sold: 5200, minOrder: 5 },
  { name: "LG Home Entertainment System", image: 7, category: "electronics", subcategory: "Audio & Video", basePrice: 1100, rating: 4.5, reviews: 97, sold: 3100, minOrder: 4 },
  { name: "Apple Wired Earphones", image: 47, category: "electronics", subcategory: "Audio & Video", basePrice: 110, rating: 4.4, reviews: 391, sold: 18200, minOrder: 25 },
  { name: "Pink Wireless Earphones", image: 48, category: "electronics", subcategory: "Audio & Video", basePrice: 175, rating: 4.2, reviews: 146, sold: 7600, minOrder: 20 },

  /* Electronics — Cameras & Drones */
  { name: "Lumix DSLR Camera", image: 12, category: "electronics", subcategory: "Cameras & Drones", basePrice: 2850, rating: 4.7, reviews: 88, sold: 1400, minOrder: 2 },
  { name: "Sony Alpha A9 Mirrorless", image: 13, category: "electronics", subcategory: "Cameras & Drones", basePrice: 5400, rating: 4.9, reviews: 61, sold: 800, minOrder: 2 },
  { name: "Tello Camera Drone", image: 17, category: "electronics", subcategory: "Cameras & Drones", basePrice: 690, rating: 4.4, reviews: 132, sold: 4300, minOrder: 5 },
  { name: "Professional Studio Camera", image: 35, category: "electronics", subcategory: "Cameras & Drones", basePrice: 3900, rating: 4.6, reviews: 45, sold: 600, minOrder: 2 },
  { name: "Atech 1080p Action Cam", image: 36, category: "electronics", subcategory: "Cameras & Drones", basePrice: 380, rating: 4.2, reviews: 157, sold: 6800, minOrder: 10 },
  { name: "Tello Super Drone Pro", image: 37, category: "electronics", subcategory: "Cameras & Drones", basePrice: 1250, rating: 4.5, reviews: 93, sold: 2200, minOrder: 4 },
  { name: "Phase One Studio Camera", image: 43, category: "electronics", subcategory: "Cameras & Drones", basePrice: 7200, rating: 4.8, reviews: 34, sold: 350, minOrder: 1 },
  { name: "Explorer 4K Camera Drone", image: 44, category: "electronics", subcategory: "Cameras & Drones", basePrice: 1850, rating: 4.6, reviews: 118, sold: 1700, minOrder: 3 },

  /* Electronics — Appliances */
  { name: "Vision Blender 900W", image: 18, category: "electronics", subcategory: "Appliances", basePrice: 210, rating: 4.3, reviews: 176, sold: 8600, minOrder: 12 },
  { name: "Vision Microwave Oven 25L", image: 19, category: "electronics", subcategory: "Appliances", basePrice: 430, rating: 4.4, reviews: 121, sold: 4700, minOrder: 6 },
  { name: "Panasonic Rice Cooker", image: 20, category: "electronics", subcategory: "Appliances", basePrice: 265, rating: 4.5, reviews: 203, sold: 7100, minOrder: 10 },
  { name: "LG Front Load Washing Machine", image: 8, category: "electronics", subcategory: "Appliances", basePrice: 2015, rating: 4.9, reviews: 156, sold: 1900, minOrder: 2 },
  { name: "Sony CCTV Security Camera", image: 38, category: "electronics", subcategory: "Appliances", basePrice: 340, rating: 4.3, reviews: 89, sold: 5600, minOrder: 10 },
  { name: "Dual Band WiFi Router AC1200", image: 3, category: "electronics", subcategory: "Appliances", basePrice: 202, rating: 4.3, reviews: 128, sold: 8900, minOrder: 20 },
  { name: "Dune HD Media Player", image: 45, category: "electronics", subcategory: "Appliances", basePrice: 520, rating: 4.2, reviews: 58, sold: 1900, minOrder: 6 },
  { name: "Panasonic Fast Charger", image: 46, category: "electronics", subcategory: "Appliances", basePrice: 95, rating: 4.3, reviews: 244, sold: 13400, minOrder: 30 },

  /* Fashion — Clothes */
  { name: "Silver High Neck Sweater", image: 21, category: "fashion", subcategory: "Clothes", basePrice: 185, rating: 4.4, reviews: 143, sold: 9400, minOrder: 20 },
  { name: "Lands Winter Jacket", image: 22, category: "fashion", subcategory: "Clothes", basePrice: 420, rating: 4.6, reviews: 201, sold: 6300, minOrder: 12 },
  { name: "Striped Casual Shirt", image: 23, category: "fashion", subcategory: "Clothes", basePrice: 130, rating: 4.2, reviews: 167, sold: 11200, minOrder: 24 },
  { name: "Blue Slim Fit Trousers", image: 24, category: "fashion", subcategory: "Clothes", basePrice: 160, rating: 4.3, reviews: 118, sold: 8700, minOrder: 24 },
  { name: "Double Wool Overcoat", image: 25, category: "fashion", subcategory: "Clothes", basePrice: 560, rating: 4.7, reviews: 84, sold: 3100, minOrder: 8 },
  { name: "Green Ski Jacket", image: 26, category: "fashion", subcategory: "Clothes", basePrice: 480, rating: 4.5, reviews: 92, sold: 2800, minOrder: 10 },
  { name: "Pink Kids Wear Set", image: 51, category: "fashion", subcategory: "Clothes", basePrice: 140, rating: 4.4, reviews: 156, sold: 8100, minOrder: 24 },
  { name: "High Waisted Gabardine Pants", image: 52, category: "fashion", subcategory: "Clothes", basePrice: 175, rating: 4.3, reviews: 104, sold: 5400, minOrder: 20 },

  /* Fashion — Accessories */
  { name: "Ray-Ban Ocean Sunglasses", image: 27, category: "fashion", subcategory: "Accessories", basePrice: 390, rating: 4.6, reviews: 274, sold: 7800, minOrder: 12 },
  { name: "Fossil Watch — Brown Leather", image: 28, category: "fashion", subcategory: "Accessories", basePrice: 620, rating: 4.7, reviews: 189, sold: 4200, minOrder: 6 },
  { name: "Silver Snapback Cap", image: 29, category: "fashion", subcategory: "Accessories", basePrice: 75, rating: 4.1, reviews: 236, sold: 16800, minOrder: 30 },
  { name: "MVMT Watch — Matte Black", image: 30, category: "fashion", subcategory: "Accessories", basePrice: 540, rating: 4.5, reviews: 147, sold: 3600, minOrder: 6 },
  { name: "Sunglasses Collection Set", image: 31, category: "fashion", subcategory: "Accessories", basePrice: 260, rating: 4.3, reviews: 165, sold: 9100, minOrder: 15 },
  { name: "Skmei Sport Watch Black", image: 32, category: "fashion", subcategory: "Accessories", basePrice: 190, rating: 4.2, reviews: 132, sold: 6900, minOrder: 12 },
  { name: "Dragon Red Wrist Watch", image: 53, category: "fashion", subcategory: "Accessories", basePrice: 230, rating: 4.3, reviews: 98, sold: 4700, minOrder: 12 },
  { name: "Police Gray Eyeglasses", image: 54, category: "fashion", subcategory: "Accessories", basePrice: 310, rating: 4.5, reviews: 173, sold: 6200, minOrder: 10 },

  /* Fashion — Shoes */
  { name: "Nike Running Sneakers — Red", image: 5, category: "fashion", subcategory: "Shoes", basePrice: 330, rating: 4.7, reviews: 731, sold: 21000, minOrder: 12 },
  { name: "Adidas Classic Sneakers — White", image: 6, category: "fashion", subcategory: "Shoes", basePrice: 294, rating: 4.4, reviews: 264, sold: 9800, minOrder: 12 },
  { name: "Nike Air — White", image: 39, category: "fashion", subcategory: "Shoes", basePrice: 410, rating: 4.6, reviews: 318, sold: 8600, minOrder: 12 },
  { name: "Puma Sport — Red", image: 40, category: "fashion", subcategory: "Shoes", basePrice: 350, rating: 4.4, reviews: 176, sold: 5900, minOrder: 12 },
  { name: "Nike Pink Edition", image: 41, category: "fashion", subcategory: "Shoes", basePrice: 375, rating: 4.5, reviews: 208, sold: 7200, minOrder: 12 },
  { name: "Nike Silver Metallic", image: 42, category: "fashion", subcategory: "Shoes", basePrice: 395, rating: 4.6, reviews: 154, sold: 4800, minOrder: 12 },
  { name: "Flow White Sneakers", image: 55, category: "fashion", subcategory: "Shoes", basePrice: 285, rating: 4.3, reviews: 121, sold: 5100, minOrder: 12 },
  { name: "Nike Mint Edition", image: 56, category: "fashion", subcategory: "Shoes", basePrice: 365, rating: 4.5, reviews: 187, sold: 6400, minOrder: 12 },
];

/* ---------------- generated product lists ---------------- */

export const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const round = (n: number) => Math.round(n);

export const retailProducts: Product[] = catalog.map((item, i) => ({
  id: `p-${i + 1}`,
  name: item.name,
  slug: slugify(item.name),
  image: `/assets/images/products/product-${item.image}.png`,
  category: item.category,
  subcategory: item.subcategory,
  rating: item.rating,
  reviews: item.reviews,
  price: item.basePrice,
  oldPrice: round(item.basePrice * 1.25),
}));

/* Wholesale: same catalog, quantity-tier prices (per unit, AED) —
   e.g. 1–10 pcs → higher price, 11–20 → cheaper, 21+ → cheapest. */
export const wholesaleProducts: Product[] = catalog.map((item, i) => ({
  id: `w-${i + 1}`,
  name: item.name,
  slug: slugify(item.name),
  image: `/assets/images/products/product-${item.image}.png`,
  category: item.category,
  subcategory: item.subcategory,
  rating: item.rating,
  reviews: item.reviews,
  minOrder: item.minOrder,
  sold: item.sold,
  priceTiers: [
    { minQty: 1, maxQty: 10, price: round(item.basePrice * 0.82) },
    { minQty: 11, maxQty: 20, price: round(item.basePrice * 0.73) },
    { minQty: 21, maxQty: null, price: round(item.basePrice * 0.65) },
  ],
}));

/* ---------------- helpers ---------------- */

export type Mode = "retail" | "wholesale";

export const getProducts = (mode: Mode) =>
  mode === "wholesale" ? wholesaleProducts : retailProducts;

export const getProductsByCategory = (mode: Mode, category: string) =>
  getProducts(mode).filter((p) => p.category === category);

export const getProductsBySubcategory = (
  mode: Mode,
  category: string,
  subcategory: string
) =>
  getProducts(mode).filter(
    (p) => p.category === category && p.subcategory === subcategory
  );

/* ---------------- brands ---------------- */

const KNOWN_BRANDS = [
  "Nike", "Adidas", "Puma", "Sony", "LG", "Apple", "Beats", "Panasonic",
  "Vision", "Xiaomi", "Tello", "Vivo", "Nokia", "HTC", "Fossil", "MVMT",
  "Ray-Ban", "Skmei", "Dune", "Netgear", "Symphony", "Rangs", "Police",
];

export const getBrand = (product: Product) => {
  const name = product.name.toLowerCase();
  if (name.includes("iphone")) return "Apple";
  return (
    KNOWN_BRANDS.find((b) => name.includes(b.toLowerCase())) ?? "Other"
  );
};

export const getBrandsForCategory = (mode: Mode, category: string) => [
  ...new Set(getProductsByCategory(mode, category).map(getBrand)),
];

/* The cheapest per-unit price (wholesale) or the retail price — used for
   price-range filtering and sorting. */
export const effectivePrice = (product: Product, mode: Mode) =>
  mode === "wholesale" && product.priceTiers?.length
    ? product.priceTiers[product.priceTiers.length - 1].price
    : (product.price ?? 0);

/* Compact price label for small cards — retail: single price;
   wholesale: per-unit range across quantity tiers. */
export const priceLabel = (product: Product, mode: Mode) => {
  if (mode === "wholesale" && product.priceTiers?.length) {
    const tiers = product.priceTiers;
    return `${formatAED(tiers[tiers.length - 1].price)} – ${formatAED(tiers[0].price)}`;
  }
  return formatAED(product.price ?? 0);
};

export const getSubcategories = (category: string) => [
  ...new Set(
    catalog.filter((c) => c.category === category).map((c) => c.subcategory)
  ),
];

/* Subcategories as {name, slug} pairs — slugs power SEO URLs like
   /electronics/cameras-drones */
export const getSubcategoryLinks = (category: string) =>
  getSubcategories(category).map((name) => ({ name, slug: slugify(name) }));

export const subcategoryNameFromSlug = (category: string, subSlug: string) =>
  getSubcategories(category).find((name) => slugify(name) === subSlug);

/** Path for a category listing page, e.g. /electronics */
export const categoryHref = (mode: Mode, category: string) =>
  `${mode === "wholesale" ? "/wholesale" : ""}/${category}`;

/** Path for a subcategory listing page, e.g. /electronics/mobiles-tablets */
export const subcategoryHref = (
  mode: Mode,
  category: string,
  subcategoryName: string
) => `${categoryHref(mode, category)}/${slugify(subcategoryName)}`;
