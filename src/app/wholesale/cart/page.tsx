import CartPage from "@/components/CartPage";

export const metadata = { title: "Wholesale Cart", robots: { index: false } };

export default function WholesaleCart() {
  return <CartPage mode="wholesale" />;
}
