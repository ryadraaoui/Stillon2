# Waitlist

`/waitlist` is the campaign landing page (Instagram bio link, Dec 22 reveal). One job: an email on the list.
It also works as the destination for every "Join the waitlist" / "Waitlist in bio" CTA.

Link to it with UTM tags so Klaviyo records which post brought each signup, e.g.
`https://www.stillonn.com/waitlist?utm_source=instagram&utm_medium=bio&utm_campaign=department`

## Where the emails go: Klaviyo

Every signup on the site (the waitlist page **and** the homepage / product page early-access forms) goes through
`/api/notify`. With these two settings it subscribes the email to a Klaviyo list with marketing consent:

| Variable | Where to find it |
| --- | --- |
| `KLAVIYO_PRIVATE_KEY` | Klaviyo → Settings → API keys → Create private API key. Give it **Lists: Full**, **Profiles: Full**, **Subscriptions: Full**. Type: **Secret** in Vercel. |
| `KLAVIYO_LIST_ID` | Klaviyo → Audience → Lists & segments → create a list called **Waitlist** → open it → Settings. The id is 6 characters, e.g. `XyZ123`. |

Optional: `NEXT_PUBLIC_WAITLIST_REVEAL_AT` (ISO date for the countdown, default 2026-12-22 12:00 ET, `off` hides it),
`NEXT_PUBLIC_WAITLIST_SHOW_COUNT_FROM` (the live count is only shown once the list reaches this number, default 100),
`KLAVIYO_REVISION` (API version, default 2025-07-15).

Each profile gets: `stillon_source` (waitlist-hero, waitlist-closer, home, pdp…), the `utm_*` values, and for the
offer forms the bundle they picked (`offer_interest`, `purchase_type`, `interval_days`).

**List opt-in:** set the Waitlist list to **single opt-in** (list Settings) so people are added straight away.
With double opt-in they must click a confirmation email first, which loses a share of signups.

## The welcome email (set up once in Klaviyo)

Flows → Create flow → Build your own → trigger **Added to list: Waitlist** → add an email, send immediately.

**Subject:** you're on the list
**Preview text:** The day isn't done. Neither are we.

> You're ON.
>
> You're on the Still ON. waitlist. That means three things:
>
> The date. You hear when N°01 goes on sale before we post it anywhere.
> The price. The bundles and what they cost come to you first.
> The first orders. The link to order reaches you before it goes public.
>
> What you're waiting for: a thin strip that dissolves on your tongue. 50 mg caffeine, 30 mg L-theanine. No water, no can. Mint.
>
> That's it. One email when it matters.
>
> Still ON.
> Montréal

Button: **See what's coming** → `https://www.stillonn.com/?utm_source=klaviyo&utm_medium=email&utm_campaign=welcome`

Suggested follow-ups in the same flow (dry, one idea each, ≤ 6-word subjects): day 3 "the hours nobody sees",
Dec 22 "first look" (product reveal), launch day "it's live". Waitlist perks (discounts, founder pricing) need founder approval first.

## The live count

`GET /api/waitlist/count` → `{ "count": 412, "source": "klaviyo", "updatedAt": "…" }`. Real Klaviyo number, cached 2 minutes,
`null` when Klaviyo is not connected. The marketing dashboard can read it for the "waitlist sign-ups" number. The page only
shows the count once it reaches `NEXT_PUBLIC_WAITLIST_SHOW_COUNT_FROM`; it never shows a made-up figure.

## Without Klaviyo

If Klaviyo is not set, signups go to `NOTIFY_WEBHOOK_URL` (any JSON webhook), or locally to `.data/early-access.jsonl`.
In production with neither, the form says the list isn't connected yet rather than pretending.

## Tests

```bash
node scripts/qa/mock-klaviyo.mjs &   # port 4030
KLAVIYO_PRIVATE_KEY=pk_test KLAVIYO_LIST_ID=L123 KLAVIYO_API_URL=http://localhost:4030/api npx next build
KLAVIYO_PRIVATE_KEY=pk_test KLAVIYO_LIST_ID=L123 KLAVIYO_API_URL=http://localhost:4030/api npx next start -p 3005
node scripts/qa/waitlist.mjs http://localhost:3005 http://localhost:4030
```
