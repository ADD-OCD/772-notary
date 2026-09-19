import type { Metadata } from "next";
import "./globals.css";

const indexingEnabled = process.env.SITE_INDEXING_ENABLED === "true" && process.env.NODE_ENV === "production";

export const metadata: Metadata = {
  title: "772 Notary",
  description: "772 Notary — mobile notary services and office appointments.",
  robots: indexingEnabled
    ? { index: true, follow: true }
    : { index: false, follow: false, noarchive: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
