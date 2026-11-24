import "server-only";

/**
 * Klaviyo (email). Off unless both settings are present:
 *   KLAVIYO_PRIVATE_KEY   a private API key (Klaviyo → Settings → API keys) with Lists: write, Profiles: write,
 *                         Subscriptions: write and Lists: read
 *   KLAVIYO_LIST_ID       the id of the waitlist list (Klaviyo → Lists & segments → your list → Settings)
 * Optional: KLAVIYO_REVISION (API version header). KLAVIYO_API_URL exists for automated tests only.
 *
 * What it does: stores the profile (with where they signed up and which bundle they liked), then subscribes the
 * email to the list with marketing consent. A Klaviyo flow triggered by "Added to list" sends the welcome email.
 * Nothing here sends email itself, so the site never emails anyone Klaviyo would not.
 */
const BASE = () => process.env.KLAVIYO_API_URL ?? "https://a.klaviyo.com/api";
const REVISION = () => process.env.KLAVIYO_REVISION ?? "2025-07-15";

export const klaviyoEnabled = () => Boolean(process.env.KLAVIYO_PRIVATE_KEY && process.env.KLAVIYO_LIST_ID);

async function call(path: string, init: { method?: string; body?: unknown; revalidate?: number } = {}) {
  const res = await fetch(`${BASE()}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`,
      revision: REVISION(),
      accept: "application/vnd.api+json",
      ...(init.body ? { "content-type": "application/vnd.api+json" } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    ...(init.revalidate !== undefined ? { next: { revalidate: init.revalidate } } : { cache: "no-store" as const }),
  });
  const json = res.status === 202 || res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.errors?.[0]?.detail ?? `Klaviyo responded ${res.status}`);
  return json;
}

export type Signup = { email: string; source: string; properties?: Record<string, string | number | boolean | null> };

/** Create/update the profile, then subscribe it to the waitlist list with email marketing consent. */
export async function klaviyoSubscribe({ email, source, properties = {} }: Signup) {
  const props = Object.fromEntries(Object.entries({ stillon_source: source, ...properties }).filter(([, v]) => v !== null && v !== undefined));
  await call("/profile-import", { method: "POST", body: { data: { type: "profile", attributes: { email, properties: props } } } });
  await call("/profile-subscription-bulk-create-jobs", {
    method: "POST",
    body: {
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          custom_source: `Still ON. site · ${source}`.slice(0, 60),
          profiles: { data: [{ type: "profile", attributes: { email, subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } } } }] },
        },
        relationships: { list: { data: { type: "list", id: process.env.KLAVIYO_LIST_ID } } },
      },
    },
  });
}

/** Real number of people on the waitlist list, or null when Klaviyo is not connected or did not answer. */
export async function klaviyoListCount(): Promise<number | null> {
  if (!klaviyoEnabled()) return null;
  try {
    const json = await call(`/lists/${process.env.KLAVIYO_LIST_ID}?additional-fields[list]=profile_count`, { revalidate: 120 });
    const n = json?.data?.attributes?.profile_count;
    return typeof n === "number" ? n : null;
  } catch (e) {
    console.error("[klaviyo] count", e);
    return null;
  }
}
