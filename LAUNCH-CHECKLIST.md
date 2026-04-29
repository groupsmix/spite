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

Full paste-in copy (product name, description, settings) is in [`docs/GUMROAD-LISTING.md`](docs/GUMROAD-LISTING.md). Don't retype anything — copy from there.

- [ ] Sign up at [gumroad.com](https://gumroad.com) (free).
- [ ] Click "New product" → "Digital product".
- [ ] Paste the name, price ($9), summary, and description from `docs/GUMROAD-LISTING.md`.
- [ ] Settings → **License keys → ON**. (If this is off, every customer pays and gets nothing. Non-negotiable.)
- [ ] Settings → **License key use limit → OFF / unlimited**. (Sharing is not the bottleneck; friction is.)
- [ ] Upload `og.png` from the repo root as the cover image.
- [ ] Publish.
- [ ] After saving, copy these two values into a note:
  - **Permalink** (the slug at the end of `https://<yourname>.gumroad.com/l/<permalink>`) — if you used the recommended default, it's `spitepro`.
  - **Product ID** (Product → "Advanced" tab → long uppercase/numeric string, ~24 characters).

## C. Wire up Gumroad in code (~2 min)

- [ ] Open `app.js`. At the top:
  ```js
  const GUMROAD_PERMALINK   = 'spitepro';        // ← your slug
  const GUMROAD_PRODUCT_ID  = 'XXXXXXXXXXXXXXX'; // ← your product id
  ```
- [ ] Commit and push. (Or send me both values and I'll do it in a 2-minute follow-up PR.)

## D. Deploy (~10 min)

**Recommended: Cloudflare Pages.** Click-by-click:

1. [ ] [dash.cloudflare.com](https://dash.cloudflare.com/) → sign in.
2. [ ] Left sidebar → **Workers & Pages**.
3. [ ] "Create" button (top right) → **Pages** tab → "Connect to Git".
4. [ ] Authorize Cloudflare on GitHub, then pick `groupsmix/spite`.
5. [ ] Project name: `spite` (this becomes `spite.pages.dev`).
6. [ ] Production branch: `main`.
7. [ ] **Build command**: leave empty (there is no build step).
8. [ ] **Build output directory**: `/`.
9. [ ] Environment variables: none.
10. [ ] "Save and Deploy". First build is ~30 seconds.
11. [ ] Once green, click the deployment. You get `https://spite.pages.dev` — that's your staging URL for testing.
12. [ ] **Custom domains** tab → "Set up a custom domain" → type `spite.lol` (or whatever you bought). If you registered via Cloudflare, DNS auto-wires in ~1 minute. If you used another registrar, Cloudflare shows you the CNAME to add.
13. [ ] Every push to `main` now auto-deploys. Give it ~30s after merge before testing.

**Already have a staging preview:** `https://spite-qkuqikan.devinapps.com` (deployed from this checkout) — for UI smoke-testing before you even touch Cloudflare. It's in demo mode (license key `SPITE-DEMO-1234-5678` unlocks Pro on the staging URL; this is intentional for pre-launch testing only).

Vercel and Netlify also work with the included `_headers` and `_redirects`. GitHub Pages works but the CDN is slower and `_headers` is ignored, so skip it.

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

## G. Launch posts (~60 min to customize, ~30 sec each to post)

Finished post copy lives in [`docs/LAUNCH-POSTS.md`](docs/LAUNCH-POSTS.md) — titles, bodies, tweet threads, TikTok script, and a fallback plan if the launch posts flop. Paste each from your own account:

- [ ] r/SideProject — Tuesday or Wednesday morning ET
- [ ] r/InternetIsBeautiful — same day (post a few hours after r/SideProject)
- [ ] IndieHackers "Showing IH" — same day
- [ ] Product Hunt — schedule for the *following* Tuesday, 12:01 AM PT
- [ ] TikTok / Reels — 15-second receipt-export video, same day as the Reddit posts
- [ ] Twitter/X thread — same day, immediately after r/SideProject goes up

Post from *your* accounts, not any Devin-labeled account. Reddit's anti-spam systems nuke new AI-adjacent accounts instantly.

Use UTM tags on every link (`?utm_source=reddit_sideproject`, `?utm_source=twitter`, etc.) — all URLs in `docs/LAUNCH-POSTS.md` already include them.

## H. Day-of-launch ops

- [ ] Watch Gumroad's dashboard, not analytics — you don't have analytics on purpose.
- [ ] Reply to Reddit/IH comments fast. The first 90 minutes of a Reddit post determine its trajectory.
- [ ] Refund anyone who asks, no questions. The boot-time re-verification will auto-revoke their Pro on next visit.
- [ ] After 7 days: tally sales. If > 100, raise to $14 and grandfather buyers. If < 20, do not build more features — the bottleneck is distribution, not product.

---

— management
