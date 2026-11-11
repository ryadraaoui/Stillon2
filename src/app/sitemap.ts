import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/products/energy-strips", "/story", "/faq", "/shipping", "/privacy", "/terms"].map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.8 }));
}
