"use client";

import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="rounded-lg bg-white p-6 shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
      <h1 className="text-xl font-bold text-heading">My Profile</h1>
      <div className="mt-5 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-2xl font-bold text-primary">
          {user.name.charAt(0)}
        </div>
        <div>
          <p className="text-base font-semibold text-heading">{user.name}</p>
          <p className="text-sm text-muted">{user.email}</p>
          <p className="mt-1 inline-block rounded-full bg-paper px-2.5 py-0.5 text-xs font-medium text-body">
            {user.role}
          </p>
        </div>
      </div>
    </div>
  );
}
