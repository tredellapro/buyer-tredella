/* API types mirroring the GraphQL schema + adapter to the local ProductCard shape. */

import type { Product as CardProduct } from "@/data/products";

export type ApiPriceTier = { minQty: number; maxQty: number | null; price: number };

export type ApiSeller = {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  description: string | null;
  verified: boolean;
  rating: number;
  positivePercent: number;
  followers: number;
  shipsFrom: string;
  deliveryEstimate: string;
  freeShippingOver: number | null;
  joinedAt: string;
  productCount: number;
};

export type ApiProduct = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  image: string;
  images?: { id: string; url: string }[];
  brand: string | null;
  retailPrice: number;
  oldPrice: number | null;
  wholesaleFrom: number | null;
  priceTiers: ApiPriceTier[];
  minOrder: number;
  stock: number;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  sold: number;
  deliveryDays: string;
  freeShipping: boolean;
  attributes?: { name: string; value: string }[];
  category?: { slug: string; name: string };
  subcategory?: { slug: string; name: string };
  seller?: Pick<ApiSeller, "slug" | "name" | "rating" | "verified">;
};

export type ApiReview = {
  id: string;
  rating: number;
  text: string;
  images: string[];
  verified: boolean;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
};

export type ApiQuestion = {
  id: string;
  text: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
  user: { name: string };
};

export type ApiCart = {
  groups: {
    seller: ApiSeller;
    items: {
      id: string;
      quantity: number;
      mode: "RETAIL" | "WHOLESALE";
      unitPrice: number;
      total: number;
      product: ApiProduct;
    }[];
    subtotal: number;
  }[];
  itemCount: number;
  total: number;
};

export type ApiOrder = {
  id: string;
  mode: string;
  status: string;
  total: number;
  createdAt: string;
  sellerOrders: {
    id: string;
    status: string;
    subtotal: number;
    seller: { name: string; slug: string };
    items: {
      id: string;
      name: string;
      image: string;
      quantity: number;
      unitPrice: number;
      total: number;
      reviewable: boolean;
      product: { slug: string };
    }[];
  }[];
};

export type ApiConversation = {
  id: string;
  type: string;
  seller: { name: string; slug: string; logo: string | null } | null;
  product: { name: string; slug: string; image: string } | null;
  lastMessage: { text: string; createdAt: string } | null;
  unreadCount: number;
  updatedAt: string;
};

export type ApiMessage = {
  id: string;
  text: string;
  createdAt: string;
  isMine: boolean;
  sender: { name: string };
};

export type ApiNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export type UiMode = "retail" | "wholesale";
export const apiMode = (mode: UiMode) =>
  mode === "wholesale" ? "WHOLESALE" : "RETAIL";

/** Adapt an API product to the shape the existing ProductCard renders. */
export const toCardProduct = (p: ApiProduct): CardProduct => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  image: p.image,
  category: p.category?.slug ?? "",
  subcategory: p.subcategory?.name ?? "",
  rating: p.rating,
  reviews: p.reviewsCount,
  price: p.retailPrice,
  oldPrice: p.oldPrice ?? undefined,
  priceTiers: p.priceTiers,
  minOrder: p.minOrder,
  sold: p.sold,
});

export const PRODUCT_CARD_FIELDS = `
  id slug sku name image brand retailPrice oldPrice wholesaleFrom
  priceTiers { minQty maxQty price }
  minOrder stock inStock rating reviewsCount sold deliveryDays freeShipping
  category { slug name } subcategory { slug name }
  seller { slug name rating verified }
`;
