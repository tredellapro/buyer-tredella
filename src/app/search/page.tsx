import type { Metadata } from "next";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import SearchResults from "@/components/SearchResults";

type Props = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    page?: string;
    category?: string;
  }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search",
    robots: { index: false },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", sort, page, category } = await searchParams;
  return (
    <>
      <Header />
      <Navbar />
      <SearchResults
        mode="retail"
        query={q}
        sort={sort}
        page={page ? parseInt(page) : 1}
        category={category}
      />
    </>
  );
}
