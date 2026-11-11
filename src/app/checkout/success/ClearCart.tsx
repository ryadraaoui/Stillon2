"use client";
import { useEffect } from "react";
import { useCart } from "@/components/Cart";

export function ClearCart() {
  const { clear } = useCart();
  useEffect(() => clear(), [clear]);
  return null;
}
