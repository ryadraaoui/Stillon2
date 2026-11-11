import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter-tight/wght.css";
import "@fontsource-variable/inter-tight/wght-italic.css";
import "./globals.css";
import { getCommerce } from "@/lib/commerce";
import { SITE } from "@/lib/site";
import { CartProvider } from "@/components/Cart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";

export const revalidate = 300;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Still ON. — Caffeine + L-theanine energy strips", template: "%s — Still ON." },
  description: "The day isn't done. Still ON. is a caffeine + L-theanine energy strip: one small white mint strip, on your tongue. 50 mg caffeine, 30 mg L-theanine. 30 to a box. From Montréal.",
  applicationName: "Still ON.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Still ON.", title: "Still ON. — The day isn't done.", description: "Caffeine + L-theanine energy strips. Open. Strip. ON.", locale: "en_CA", url: "/" },
  twitter: { card: "summary_large_image", title: "Still ON. — The day isn't done.", description: "Caffeine + L-theanine energy strips. Open. Strip. ON." },
};
export const viewport: Viewport = { themeColor: "#f7f3ee", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const commerce = await getCommerce();
  return (
    <html lang="en" className="antialiased">
      <body>
        <CartProvider commerce={commerce}>
          <SmoothScroll />
          <Header />
          <main id="main" className="page-in">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
