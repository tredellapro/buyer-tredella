import Link from "next/link";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <>
      <Header />
      <Navbar />
      <main className="flex flex-1 items-center justify-center bg-paper px-4 py-20">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
          <p className="text-5xl font-bold text-primary">404</p>
          <h1 className="mt-3 text-xl font-bold text-heading">
            We couldn&apos;t find that page
          </h1>
          <p className="mt-2 text-sm text-body">
            The product or category you&apos;re looking for may have been moved
            or is no longer available.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/"
              className="flex-1 rounded bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Go Home
            </Link>
            <Link
              href="/electronics"
              className="flex-1 rounded border border-line py-3 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
