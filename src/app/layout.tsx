import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter-tight/wght.css";
import "@fontsource-variable/inter-tight/wght-italic.css";
import "./globals.css";
import { getCommerce } from "@/lib/commerce";
import { SITE } from "@/lib/site";
import { CartProvider } from "@/components/Cart";
import { BagProvider } from "@/components/Bag";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";

export const revalidate = 300;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Still ON. — Caffeine, without the can", template: "%s — Still ON." },
  description: "Caffeine, without the can. Still ON. is a dissolvable caffeine strip: 50 mg per strip, no water needed, pocket-sized. Get early access.",
  applicationName: "Still ON.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Still ON.", title: "Still ON. — The day isn't done.", description: "Caffeine, without the can. Dissolvable caffeine strips. Get early access.", locale: "en_CA", url: "/" },
  twitter: { card: "summary_large_image", title: "Still ON. — The day isn't done.", description: "Caffeine, without the can. Dissolvable caffeine strips. Get early access." },
};
export const viewport: Viewport = { themeColor: "#f7f3ee", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const commerce = await getCommerce();
  return (
    <html lang="en" className="antialiased">
      <body>
        <CartProvider commerce={commerce}>
          <BagProvider>
          <SmoothScroll />
          <Header />
          <main id="main" className="page-in">
            {children}
          </main>
          <Footer />
          </BagProvider>
        </CartProvider>
      </body>
    </html>
  );
}
