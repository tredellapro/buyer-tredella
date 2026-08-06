"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatAED } from "@/data/products";
import { gqlAuth } from "@/lib/graphql";
import { useAuth } from "@/lib/auth";
import type { ApiOrder } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[] | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    gqlAuth<{ getOrders: ApiOrder[] }>(
      `query {
        getOrders {
          id mode status total createdAt
          sellerOrders { id status seller { name } items { id name quantity } }
        }
      }`
    ).then((data) => setOrders(data.getOrders));
  }, [user]);

  return (
    <div className="rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
      <h1 className="text-xl font-bold text-heading">My Orders</h1>

      {!orders ? (
        <p className="mt-6 text-sm text-muted">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          No orders yet.{" "}
          <Link href="/" className="font-semibold text-primary hover:underline">
            Start shopping
          </Link>
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line p-4 hover:border-primary"
            >
              <div>
                <p className="text-sm font-semibold text-heading">
                  #{order.id.slice(-8).toUpperCase()}
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[order.status] ?? "bg-paper text-body"}`}
                  >
                    {order.status}
                  </span>
                  <span className="ml-2 rounded-full bg-paper px-2 py-0.5 text-[10px] font-medium text-body">
                    {order.mode}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted">
                  {new Date(order.createdAt).toLocaleString()} ·{" "}
                  {order.sellerOrders.length} seller
                  {order.sellerOrders.length > 1 ? "s" : ""} ·{" "}
                  {order.sellerOrders.reduce((n, so) => n + so.items.length, 0)}{" "}
                  items
                </p>
              </div>
              <span className="text-base font-bold text-primary">
                {formatAED(order.total)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
