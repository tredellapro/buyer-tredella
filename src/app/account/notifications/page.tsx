"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { gqlAuth } from "@/lib/graphql";
import { useAuth } from "@/lib/auth";
import type { ApiNotification } from "@/lib/types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<ApiNotification[] | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    gqlAuth<{ getNotifications: ApiNotification[] }>(
      `query { getNotifications { id type title body link readAt createdAt } }`
    ).then((data) => setNotifications(data.getNotifications));
  }, [user]);

  const markAllRead = async () => {
    await gqlAuth(`mutation { markNotificationAsRead }`);
    setNotifications(
      (prev) =>
        prev?.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })) ??
        null
    );
  };

  const unread = notifications?.filter((n) => !n.readAt).length ?? 0;

  return (
    <div className="rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-heading">
          Notifications{" "}
          {unread > 0 && (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">
              {unread} new
            </span>
          )}
        </h1>
        {unread > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-sm font-medium text-primary hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {!notifications ? (
        <p className="mt-6 text-sm text-muted">Loading…</p>
      ) : notifications.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No notifications yet.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {notifications.map((n) => {
            const content = (
              <div
                className={`rounded-lg border p-4 ${
                  n.readAt ? "border-line" : "border-primary/40 bg-primary-light/30"
                }`}
              >
                <p className="text-sm font-semibold text-heading">{n.title}</p>
                {n.body && <p className="mt-0.5 text-sm text-body">{n.body}</p>}
                <p className="mt-1 text-xs text-muted">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            );
            return n.link ? (
              <Link key={n.id} href={n.link} className="block">
                {content}
              </Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
