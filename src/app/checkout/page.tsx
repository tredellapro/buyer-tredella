"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import { formatAED } from "@/data/products";
import { gqlAuth } from "@/lib/graphql";
import { useAuth } from "@/lib/auth";
import { emitCartUpdated } from "@/lib/cart-count";
import type { ApiCart } from "@/lib/types";

type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  country: string;
  isDefault: boolean;
};

function Checkout() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "WHOLESALE" ? "WHOLESALE" : "RETAIL";
  const prefix = mode === "WHOLESALE" ? "/wholesale" : "";

  const [cart, setCart] = useState<ApiCart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [form, setForm] = useState({ label: "Home", fullName: "", phone: "", line1: "", city: "Dubai" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const load = useCallback(async () => {
    const data = await gqlAuth<{ getCart: ApiCart; me: { addresses: Address[] } | null }>(
      `query($mode: Mode!) {
        getCart(mode: $mode) {
          itemCount total
          groups { seller { id name } subtotal items { id quantity unitPrice total product { name } } }
        }
        me { addresses { id label fullName phone line1 city country isDefault } }
      }`,
      { mode }
    );
    setCart(data.getCart);
    const list = data.me?.addresses ?? [];
    setAddresses(list);
    setSelectedAddress(list.find((a) => a.isDefault)?.id ?? list[0]?.id ?? null);
    if (list.length === 0) setShowAddressForm(true);
  }, [mode]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/checkout?mode=${mode}`)}`);
      return;
    }
    load().catch((e) =>
      setError(e instanceof Error ? e.message : "Could not load checkout.")
    );
  }, [authLoading, user, load, router, mode]);

  const saveAddress = async () => {
    if (!form.fullName || !form.phone || !form.line1) {
      setError("Please fill in all address fields.");
      return;
    }
    setError(null);
    const data = await gqlAuth<{ addAddress: Address }>(
      `mutation($input: AddressInput!) { addAddress(input: $input) { id label fullName phone line1 city country isDefault } }`,
      { input: { ...form, isDefault: addresses.length === 0 } }
    );
    setAddresses([...addresses, data.addAddress]);
    setSelectedAddress(data.addAddress.id);
    setShowAddressForm(false);
  };

  const placeOrder = async () => {
    setBusy(true);
    setError(null);
    try {
      const data = await gqlAuth<{ createOrder: { id: string } }>(
        `mutation($mode: Mode!, $addressId: ID) {
          createOrder(mode: $mode, addressId: $addressId) { id }
        }`,
        { mode, addressId: selectedAddress }
      );
      emitCartUpdated();
      router.push(`/thank-you?order=${data.createOrder.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not place order.");
      setBusy(false);
    }
  };

  const inputClass =
    "h-11 w-full rounded-md border border-line px-4 text-sm outline-none placeholder:text-muted focus:border-primary";

  return (
    <main className="flex-1 bg-paper pb-14 pt-6">
      <div className="container mx-auto px-2">
        <h1 className="text-2xl font-bold text-heading">Checkout</h1>
        {error && <p className="mt-2 text-sm text-primary">{error}</p>}

        {!cart ? (
          <p className="mt-10 text-center text-sm text-muted">Loading…</p>
        ) : cart.groups.length === 0 ? (
          <div className="mt-6 rounded-lg bg-white py-16 text-center shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
            <p className="text-sm text-muted">Your cart is empty.</p>
            <Link href={prefix || "/"} className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 space-y-5">
              {/* Address */}
              <section className="rounded-lg bg-white p-5 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
                <h2 className="text-base font-bold text-heading">
                  Delivery Address
                </h2>

                <div className="mt-3 space-y-2">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm ${
                        selectedAddress === address.id
                          ? "border-primary bg-primary-light/40"
                          : "border-line"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === address.id}
                        onChange={() => setSelectedAddress(address.id)}
                        className="mt-0.5 accent-[#e94560]"
                      />
                      <span>
                        <span className="font-semibold text-heading">
                          {address.label} — {address.fullName}
                        </span>
                        <br />
                        <span className="text-body">
                          {address.line1}, {address.city}, {address.country} ·{" "}
                          {address.phone}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>

                {showAddressForm ? (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input className={inputClass} placeholder="Label (Home / Office)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
                    <input className={inputClass} placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                    <input className={inputClass} placeholder="Phone (+971…)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    <input className={inputClass} placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                    <input className={`${inputClass} sm:col-span-2`} placeholder="Street address" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
                    <button
                      type="button"
                      onClick={saveAddress}
                      className="rounded bg-heading px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 sm:col-span-2"
                    >
                      Save Address
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="mt-3 text-sm font-medium text-primary hover:underline"
                  >
                    + Add new address
                  </button>
                )}
              </section>

              {/* Order lines grouped by seller */}
              <section className="rounded-lg bg-white p-5 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
                <h2 className="text-base font-bold text-heading">
                  Order Items{" "}
                  <span className="text-xs font-normal text-muted">
                    ({cart.groups.length} seller{cart.groups.length > 1 ? "s" : ""} — each ships separately)
                  </span>
                </h2>
                {cart.groups.map((group) => (
                  <div key={group.seller.id} className="mt-3 border-t border-line pt-3">
                    <p className="text-sm font-semibold text-heading">
                      {group.seller.name}
                    </p>
                    {group.items.map((item) => (
                      <div key={item.id} className="mt-1 flex justify-between text-sm text-body">
                        <span>
                          {item.product.name} × {item.quantity}
                        </span>
                        <span className="font-medium text-heading">
                          {formatAED(item.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </section>
            </div>

            {/* Summary */}
            <aside className="h-fit w-full rounded-lg bg-white p-5 shadow-[0_1px_3px_rgba(43,52,69,0.1)] lg:w-80">
              <h2 className="text-base font-bold text-heading">Total</h2>
              <div className="mt-3 flex justify-between text-base font-bold text-heading">
                <span>{cart.itemCount} items</span>
                <span className="text-primary">{formatAED(cart.total)}</span>
              </div>
              <p className="mt-2 text-xs text-muted">
                Payment: Cash on Delivery (demo). Prices are validated
                server-side when the order is created.
              </p>
              <button
                type="button"
                onClick={placeOrder}
                disabled={busy || !selectedAddress}
                className="mt-4 w-full rounded bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
              >
                {busy ? "Placing order…" : "Place Order"}
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <Navbar />
      <Suspense>
        <Checkout />
      </Suspense>
    </>
  );
}
