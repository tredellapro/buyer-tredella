import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/auth";
import Toaster from "@/components/Toaster";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tredella.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tredella — Retail & Wholesale Marketplace in the Gulf",
    template: "%s | Tredella",
  },
  description:
    "Shop retail or buy wholesale in bulk with quantity-based AED pricing. Electronics, fashion and more — fast delivery across the Gulf.",
  keywords: [
    "wholesale",
    "retail",
    "marketplace",
    "bulk buying",
    "AED",
    "Gulf",
    "UAE",
    "electronics",
    "fashion",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Tredella",
    title: "Tredella — Retail & Wholesale Marketplace in the Gulf",
    description:
      "Shop retail or buy wholesale in bulk with quantity-based AED pricing. Fast delivery across the Gulf.",
    url: SITE_URL,
    images: [{ url: "/assets/images/logo.png", width: 150, height: 44, alt: "Tredella" }],
  },
  twitter: {
    card: "summary",
    title: "Tredella — Retail & Wholesale Marketplace in the Gulf",
    description:
      "Shop retail or buy wholesale in bulk with quantity-based AED pricing.",
  },
  robots: { index: true, follow: true },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Tredella",
  url: SITE_URL,
  logo: `${SITE_URL}/assets/images/logo.png`,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Tredella",
  url: SITE_URL,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla) inject attributes on <body> before hydration */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <AuthProvider>
          {children}
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
