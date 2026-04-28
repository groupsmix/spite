# SPITE — launch checklist (you-the-human)

The code in this repo is launch-ready. Everything below requires **your accounts, payment method, or human posting**. Tick them off in order. Total time end-to-end: ~90 minutes of active work over 1–2 days.

---

## A. Domain (~10 min, ~$12)

- [ ] Buy a domain at [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) (cheapest, no markup) or Namecheap.
  - Preferred: `spite.lol` → `spitetracker.com` → `getspite.com` → `spite.app`.
  - Avoid `spite.io` (premium-priced).
- [ ] Update the domain everywhere in the repo if you pick something other than `spite.lol`:
  - `index.html` `<link rel="canonical">`, `og:url`, `twitter:image`
  - `privacy.html`, `terms.html` `<link rel="canonical">`
  - `sitemap.xml`
  - JSON-LD `url` field
  - The "made with SPITE · spite.lol" watermark in `app.js` (search for `spite.lol`)

## B. Gumroad product (~15 min, $0)

- [ ] Sign up at [gumroad.com](https://gumroad.com) (free).
- [ ] Create a new product:
  - **Type**: Digital product
  - **Name**: `SPITE Pro`
  - **Price**: `$9` (one-time)
  - **Description**: copy from the in-app `#proModal` (unlimited grudges, watermark removal, JSON export, priority on next petty feature). **Do not list themes, cloud sync, or PDF export as "included today"** — these are roadmap items and the pricing card already says so honestly.
  - **License keys**: turn this **ON** (Settings → "Generate a unique license key for each customer").
- [ ] After saving, note these two values:
  - **Permalink** (the slug at the end of `https://yourname.gumroad.com/l/<permalink>`).
  - **Product ID** (Product → "Advanced" tab → long uppercase string).

## C. Wire up Gumroad in code (~2 min)

- [ ] Open `app.js`. At the top:
  ```js
  const GUMROAD_PERMALINK   = 'spitepro';        // ← your slug
  const GUMROAD_PRODUCT_ID  = 'XXXXXXXXXXXXXXX'; // ← your product id
  ```
- [ ] Commit and push. (Or send me both values and I'll do it in a 2-minute follow-up PR.)

## D. Deploy (~10 min)

**Recommended: Cloudflare Pages.**
- [ ] Cloudflare dashboard → **Workers & Pages** → "Create" → "Pages" → "Connect to Git".
- [ ] Pick this repo. Build command: **none**. Output directory: `/`.
- [ ] Click Deploy. ~30 seconds.
- [ ] Pages → your project → **Custom domains** → add the domain you bought in A. DNS auto-wires if you bought through Cloudflare.

Vercel and Netlify also work with the included `_headers` and `_redirects`. GitHub Pages works but the CDN is slower.

## E. End-to-end test on the live URL (~10 min, ~$9 refundable)

- [ ] Open the live URL in a normal window. File a couple of grudges. Confirm 5-grudge limit hits the Pro modal.
- [ ] Click "unlock pro" → goes to your Gumroad product.
- [ ] Buy your own product with a real card (you'll refund yourself in a moment).
- [ ] Get the license-key email from Gumroad. Paste it into "i already have a license key" in SPITE.
- [ ] Confirm: Pro unlocks, "UNLOCKED" badge appears, free-tier 5-grudge cap is gone, watermark disappears from new receipt cards.
- [ ] Hard-refresh the tab. Confirm Pro state persists (localStorage).
- [ ] Open the URL in an incognito window. Confirm Free state, 5-grudge cap, watermark on receipts.
- [ ] On a phone: install the PWA from the browser menu. Confirm landing reads cleanly, receipt download works.
- [ ] On Gumroad: refund yourself.
- [ ] Hard-refresh the live URL where you pasted the key. Within a few seconds, the boot-time re-verification should revoke Pro automatically (you'll see a toast: "pro license revoked (refunded)"). If it doesn't, manually paste the key — verification will refuse it.

## F. Support address (~5 min)

- [ ] Set up a real inbox you check daily. Options: a `hello@<your-domain>` email forward (free with Cloudflare Email Routing), or a Gmail you'll actually open.
- [ ] Update the `mailto:` link in `index.html` footer if it isn't already pointing there.
- [ ] Save a refund-instructions canned reply ("Refunds are processed by Gumroad within 7 days, no questions. Forward your purchase email or use this link: …").

## G. Launch posts (~60 min for the writing, ~30 sec each to post)

I'll deliver finished post copy in a follow-up message:
- [ ] r/SideProject — Tuesday or Wednesday morning ET
- [ ] r/InternetIsBeautiful — same day
- [ ] IndieHackers "Showing" — same day
- [ ] Product Hunt — schedule for the following Tuesday
- [ ] TikTok/Reels — 15-second receipt-export video, posted same day as the Reddit posts

Use UTM tags on each link (`?utm_source=reddit`, `?utm_source=tiktok`, etc.) so Gumroad can attribute revenue.

## H. Day-of-launch ops

- [ ] Watch Gumroad's dashboard, not analytics — you don't have analytics on purpose.
- [ ] Reply to Reddit/IH comments fast. The first 90 minutes of a Reddit post determine its trajectory.
- [ ] Refund anyone who asks, no questions. The boot-time re-verification will auto-revoke their Pro on next visit.
- [ ] After 7 days: tally sales. If > 100, raise to $14 and grandfather buyers. If < 20, do not build more features — the bottleneck is distribution, not product.

---

— management
