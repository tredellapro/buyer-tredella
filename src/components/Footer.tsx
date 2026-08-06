import Image from "next/image";
import Link from "next/link";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
  LinkedinIcon,
} from "./icons";

/* Standard footer — Alibaba-style light layout: link columns, social icons,
   payment methods row, and a legal bottom bar. */

const columns = [
  {
    title: "About Tredella",
    links: [
      "Why choose Tredella",
      "About Us",
      "Corporate Responsibility",
      "Careers",
    ],
  },
  {
    title: "Order Protection",
    links: [
      "Secure Payments",
      "Money-back Guarantee",
      "Guaranteed On-time Delivery",
      "After-sales Protections",
      "Policies & Rules",
    ],
  },
  {
    title: "Source on Tredella",
    links: [
      "Retail Shopping",
      "Wholesale & Bulk Buying",
      "Verified Suppliers",
      "Request for Quotation",
    ],
  },
  {
    title: "Help Center",
    links: [
      "Buyer Help Center",
      "Live Chat",
      "Track Your Order",
      "Refunds & Returns",
      "Report a Violation",
    ],
  },
  {
    title: "Sell on Tredella",
    links: [
      "Start Selling",
      "Become a Verified Supplier",
      "Check Order Status",
      "Partnerships",
    ],
  },
];

const payments = [
  { name: "Visa", image: "/assets/images/payments/Visa.svg" },
  { name: "Mastercard", image: "/assets/images/payments/Mastercard.svg" },
  { name: "PayPal", image: "/assets/images/payments/PayPal.svg" },
  { name: "Amex", image: "/assets/images/payments/Amex.svg" },
];

const socials = [
  { name: "Facebook", Icon: FacebookIcon },
  { name: "LinkedIn", Icon: LinkedinIcon },
  { name: "Twitter", Icon: TwitterIcon },
  { name: "Instagram", Icon: InstagramIcon },
  { name: "YouTube", Icon: YoutubeIcon },
];

const legalLinks = [
  "Legal Notice",
  "Product Listing Policy",
  "Intellectual Property Protection",
  "Privacy Policy",
  "Terms of Use",
  "Integrity Compliance",
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-white">
      {/* Link columns */}
      <div className="container mx-auto px-2 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-semibold text-heading">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-body hover:text-primary"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Socials + payments */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-heading">
              Stay Connected
            </span>
            <div className="flex items-center gap-3">
              {socials.map(({ name, Icon }) => (
                <Link
                  key={name}
                  href="#"
                  aria-label={name}
                  className="text-muted transition-colors hover:text-primary"
                >
                  <Icon size={19} />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {payments.map((payment) => (
              <span
                key={payment.name}
                className="flex h-8 w-13 items-center justify-center rounded border border-line bg-white p-1"
              >
                <Image
                  src={payment.image}
                  alt={payment.name}
                  width={40}
                  height={24}
                  className="h-full w-auto object-contain"
                />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Legal bottom bar */}
      <div className="border-t border-line bg-paper">
        <div className="container mx-auto px-2 py-5 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            {legalLinks.map((link, i) => (
              <span key={link} className="flex items-center gap-2">
                {i > 0 && <span className="text-line">·</span>}
                <Link
                  href="#"
                  className="text-xs text-muted hover:text-primary"
                >
                  {link}
                </Link>
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">
            © {new Date().getFullYear()} Tredella.com. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
