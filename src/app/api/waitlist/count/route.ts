import { NextResponse } from "next/server";
import { klaviyoListCount } from "@/lib/klaviyo";

/**
 * GET /api/waitlist/count → { count, source, updatedAt }
 * The real number of people on the Klaviyo waitlist list, for the marketing dashboard. count is null when Klaviyo
 * is not connected: never a guess. Cached for two minutes. Contains no personal data.
 */
export const revalidate = 120;

export async function GET() {
  const count = await klaviyoListCount();
  return NextResponse.json(
    { count, source: count === null ? "not-connected" : "klaviyo", updatedAt: new Date().toISOString() },
    { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } },
  );
}
