import CartPage from "@/components/CartPage";

export const metadata = { title: "Shopping Cart", robots: { index: false } };

export default function Cart() {
  return <CartPage mode="retail" />;
}
