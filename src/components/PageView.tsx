"use client";
import { useEffect } from "react";
import { track } from "@/lib/track";

/** Fires once when the product page is opened. */
export function PageView() {
  useEffect(() => track("product_page_view"), []);
  return null;
}
