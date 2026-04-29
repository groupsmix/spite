# Gumroad product listing — paste-in copy

Create the product at https://gumroad.com/dashboard/products/new → **Digital product**.

Copy each field verbatim.

---

## Name

```
SPITE Pro — petty grudge tracker (lifetime unlock)
```

## URL / permalink (slug)

```
spitepro
```

Your product URL will be `https://<yourname>.gumroad.com/l/spitepro`. Send me the full URL after you save and I'll wire it into the code in a 2-line PR.

## Price

```
9
```

One-time. USD. No subscription.

## Summary (short description shown at the top of the product page)

```
Days since they wronged you. A petty grudge tracker that runs entirely
in your browser. One-time $9 unlocks the full version forever.
```

## Description (long description, rich text)

Paste the block below. It matches the in-app pricing card so the customer sees the same list in both places — the most common refund reason on Gumroad is "the product wasn't what the page promised", so keeping these in sync matters.

```
SPITE is a petty grudge tracker. It's a joke product that also works.

You file grudges. The app counts days since. You can screenshot a grudge
as a "receipt card" and post it. Therapy says let it go; you will not.

Free forever, up to 5 grudges. Pro ($9 once, lifetime) unlocks:

• Unlimited grudges
• Watermark removed from exported receipt cards
• JSON export / import of your full archive
• Priority request on the next petty feature I build

Arriving with your license when they ship (no extra charge, this is not a subscription):

• 6 themes (default dark, daylight, notebook, 90s-crt, therapist-beige, red-wedding)
• Encrypted cloud sync across devices
• Full PDF export of your grievance archive

Privacy:
• Your grudges live in localStorage on your device. They never leave.
• No account, no email, no analytics, no tracking, no server.
• I cannot read your data even if I wanted to. There is no "I".

Refunds:
• 7-day no-questions refund through Gumroad.
• If you refund, your license automatically deactivates on your next
  visit to the app. No paperwork.

This is a one-person project. Support is real but slow. The product
works offline as a PWA — install it to your phone's home screen.

(Built with vanilla JS and bad feelings. No dependencies at runtime.)
```

## Cover image (1280×720, used as the thumbnail on Gumroad + social shares)

Use the existing `og.png` in the repo root as a placeholder. Upgrade to a real hero render later if desired. To export a fresh one, open the live site, screenshot the hero, crop to 1280×720, save as `.png`.

## License keys

**Settings → "Generate a unique license key for each customer" → ON.**

This is non-negotiable — the in-app unlock flow is 100% keyed on license verification. Without this, customers buy and get nothing.

**Settings → "Limit license key uses" → OFF.**

Letting a customer paste their key on their phone AND laptop is worth more than preventing a trivial amount of sharing.

## Product tags

```
productivity, indie, humor, privacy, pwa, one-time-payment, no-subscription
```

## Call-to-action button text

```
I want this
```

(Gumroad default. Don't overthink it.)

---

# After you save

Send me these two values and I'll open a follow-up PR that flips the site from demo mode to real Gumroad verification:

1. **Product permalink** (the slug — if you kept the default above, it's `spitepro`).
2. **Product ID** (Product → "Advanced" tab → long uppercase/numeric string, ~24 characters).

Or paste them into `app.js` yourself at the top:

```js
const GUMROAD_PERMALINK   = 'spitepro';
const GUMROAD_PRODUCT_ID  = 'XXXXXXXXXXXXXXXXXXXXXXXX';
```

And push to `main`. Either way works.
