# SPITE — Launch Playbook

A petty grudge tracker, sold as a $9 one-time unlock. Static site, zero infrastructure, ~100% margin.

This document is the operational playbook to take SPITE from "demo deployed" to "first dollar in your bank account."

---

## TL;DR — what to do today

1. Buy a domain (`spite.lol` or `spitetracker.com`) — ~$12.
2. Create a Gumroad product → get a **product ID** and a **buy URL**.
3. Open `app.js`, set `GUMROAD_PERMALINK` and `GUMROAD_PRODUCT_ID` (two lines at the top).
4. Re-host the site on Cloudflare Pages or Vercel (free, faster). Point your domain at it.
5. Post one launch thread on each: r/SideProject, r/InternetIsBeautiful, IndieHackers, Product Hunt. One TikTok/Reels video showing the receipt-card export.
6. Wake up. Check Gumroad. Repeat.

Realistic week-one range: **0–200 sales × $9 ≈ $0–$1,800 gross / $0–$1,500 net** after Gumroad+Stripe fees. The bottom of the range is "no launch post hits" (most likely outcome). The top is "one of the launch posts goes viral on Reddit or TikTok" (rare but real). Plan for the bottom; celebrate the top.

---

## What's in this folder

| file | what it is |
|------|------------|
| `index.html` | the entire site — landing + tracker + modals |
| `styles.css` | brutalist dark UI |
| `app.js` | logic, receipt canvas, Gumroad license verification |
| `LAUNCH.md` | this document |

It's a static site. Drop all four files into any host (Cloudflare Pages, Vercel, Netlify, GitHub Pages, S3, your shared hosting). No build step. No environment variables. No backend.

---

## Step 1 — Domain (~$12, 5 minutes)

Buy from Cloudflare Registrar (cheapest, no markup) or Namecheap.

Suggested order of preference:

1. `spite.lol` — short, memorable, exactly the brand
2. `spitetracker.com`
3. `getspite.com` / `spite.app` / `spite.cafe`

Avoid `spite.io` (usually ~$50+) unless you really want it.

---

## Step 2 — Gumroad product (~10 minutes)

1. Sign up at [gumroad.com](https://gumroad.com) (free).
2. Create a new product:
   - **Type**: Digital product (or "Membership" → "I'll deliver content separately"). Either works.
   - **Name**: `SPITE Pro`
   - **Price**: `$9` (one-time)
   - **Description**: copy from the in-app `#proModal` (unlimited grudges, themes, no watermark, etc.)
   - **License keys**: turn this **ON**. Gumroad will auto-issue a unique key per buyer. This is what your site verifies.
3. After creating the product:
   - Note the **product permalink** — it's the slug at the end of `https://yourname.gumroad.com/l/<permalink>`. e.g. `spitepro`.
   - Open the product → **Advanced** tab → copy the **Product ID** (long uppercase string).

You now have everything you need to wire it up.

---

## Step 3 — Wire it up (~2 minutes)

Open `app.js`. The first ~20 lines are a config block:

```js
const GUMROAD_PERMALINK = 'spitepro';      // ← your slug
const GUMROAD_PRODUCT_ID = '';              // ← paste product id here
```

- Set `GUMROAD_PERMALINK` to your product permalink (the slug). The "unlock pro" button opens `https://gumroad.com/l/<permalink>?wanted=true`, which triggers Gumroad's checkout overlay.
- Set `GUMROAD_PRODUCT_ID` to your product id.

That's it. The "i already have a license key" flow now POSTs to `https://api.gumroad.com/v2/licenses/verify` (CORS-enabled, no server needed) and only unlocks Pro on a real, non-refunded purchase.

**Demo mode**: if you leave `GUMROAD_PRODUCT_ID` empty, the form-check fallback accepts any key matching `SPITE-XXXX-XXXX-XXXX` (and the literal `SPITE-DEMO-1234-5678`). Useful for testing the unlock UI before your product is live.

---

## Step 4 — Host it (~5 minutes)

### Cloudflare Pages (recommended — free, fastest CDN)

1. Push these four files to a new GitHub repo.
2. Cloudflare dashboard → Pages → "Connect to Git" → pick the repo.
3. Build settings: **none**. Output directory: `/`.
4. Deploy. You get a `*.pages.dev` URL in ~30 seconds.
5. Add your custom domain in the Pages → Custom domains tab. Cloudflare wires DNS automatically if you bought the domain there.

### Alternatives

- **Vercel**: same flow, also free, also instant. Pick this if you already use Vercel.
- **Netlify**: same flow. Drop a `_redirects` file later if you want pretty URLs.
- **GitHub Pages**: works, but slower CDN. Fine for low-volume.
- **The current `devinapps.com` URL**: also works. Slap a Cloudflare DNS CNAME at it. But the long subdomain reads "demo," not "product." Move off it before launch.

---

## Step 5 — Pre-launch checklist

Before posting anywhere, do this once on the live URL:

- [ ] Buy your own product on Gumroad (you can refund yourself).
- [ ] Paste the real key into "i already have a license key" → confirm it unlocks.
- [ ] Hard-refresh → confirm Pro state persists (localStorage).
- [ ] Open in an incognito window → confirm Free state, 5-grudge limit.
- [ ] On a phone → confirm landing page reads well, receipt card is downloadable.
- [ ] Open the OG meta — paste your URL into [opengraph.xyz](https://www.opengraph.xyz/) to check what social previews look like. Add an `og:image` if you want one (any 1200×630 PNG named `og.png` referenced in `<meta property="og:image">`).
- [ ] Refund yourself on Gumroad → confirm the same key now fails verification with "this purchase was refunded."

---

## Step 6 — Launch posts

The receipt card IS the marketing. Lead with it everywhere.

### Reddit (highest yield for product launches)

Post on **launch day, Tuesday or Wednesday morning ET**. Pick subs in this order:

1. **r/SideProject** — friendly, expects launches. Title: *"I built SPITE — a petty grudge tracker. $9 once, no subscription. The receipt cards are the whole pitch."*
2. **r/InternetIsBeautiful** — VERY strict on commercial posts, but if you frame it as a "weird useful website," it works. Title: *"Days since they wronged you — a brutalist little site I can't stop using."*
3. **r/IndieHackers** — talk numbers and process, not pitch.
4. **r/Entrepreneur** — quieter, but converts.

Body template (adapt the voice; do NOT copy verbatim):

> Built a petty little site. It tracks how many days since people did something annoying — coworkers, exes, family, landlords, yourself. Local-only, no signup, no analytics. The receipt-card export is the part I'm proud of: you generate a 1080×1350 PNG and post it.
>
> Built it in a weekend. $9 unlocks unlimited grudges + removes the watermark. No subscription because subscriptions for a grudge tracker would be insane.
>
> Link: <your URL>
>
> Happy to answer questions about the build (vanilla JS, canvas API, Gumroad license verification — no backend).

Include 2-3 sample receipt PNGs as imgur links inline.

### TikTok / Instagram Reels (the real engine)

A 15-second video with this beat:

1. (0–2s) Type a grievance into the form.
2. (2–4s) Save → big counter shows "12 DAYS SINCE."
3. (4–9s) Click "make receipt" → receipt card draws with grain texture.
4. (9–13s) Download, post the receipt.
5. (13–15s) Caption: *"days since they wronged you. counted."*

Caption: `pov: you finally found an app that doesn't tell you to "let it go"`. Tag: `#petty #grudge #app #indiedev`. Post the URL in bio.

This format goes viral on petty/relationship TikTok regularly. Reposts on r/CharacterRant, IG meme accounts, etc. Each repost = free traffic.

### Product Hunt

Schedule for a Tuesday. Tagline: *"Days since they wronged you. Counted."* Description leads with the receipt card. First comment from the maker should be one paragraph + link to the source code (open-sourcing it isn't required, but PH rewards transparency).

### IndieHackers

A "Showing" post focused on the build, the pricing rationale ($9 vs subscription), and the no-backend architecture. IH audience buys *to support* the build as much as the product.

---

## Step 7 — Post-launch operations

You did nothing fancy, so there's nothing fancy to operate.

- **Refunds**: handled by Gumroad. Refund within 7 days, no questions. The verify endpoint correctly returns `refunded: true`, and the in-app verifier rejects refunded purchases.
- **Support**: link a `mailto:` in the footer. Real volume will be near-zero.
- **Updates**: edit `app.js`, push to git, Cloudflare auto-redeploys. Existing Pro users keep Pro (license key is in their localStorage; verification re-runs only when they reset).

### Tracking sales without analytics

Gumroad has its own dashboard with totals + per-day. That's all you need. If you want UTM tracking on Reddit/TikTok, append `?utm_source=reddit` to the URLs you post and Gumroad picks it up on its own checkout pages.

If you must add traffic analytics, use [Plausible](https://plausible.io) ($9/mo) or self-host [Umami](https://umami.is). **Do not add Google Analytics** — it would directly contradict the "no analytics" pitch in the manifesto, and the manifesto is part of why people buy.

---

## Step 8 — Things to ship next (in priority order)

These are the realistic next moves to keep the product alive after launch week.

1. **Themes (Pro)** — the modal advertises 6 themes (blood orange, courthouse, voicemail). They aren't built yet. Pick one and ship it the week after launch as a "thanks for buying" update post.
2. **Encrypted cloud sync (Pro)** — Pro users get a magic-link login (Supabase or Clerk free tier), and grudges sync E2E-encrypted between devices. The Pro page already promises this; ship it within 30 days.
3. **PDF export (Pro)** — print all grudges as a "court filing" PDF using `jsPDF`. Funny artifact, fits the brand.
4. **Reminders** — opt-in browser notifications when a grudge hits day-30 / day-100 / day-365. Pure retention.
5. **Multi-language** — start with Spanish + Portuguese. Latin America loves petty product humor.

Do NOT add: social feeds, public profiles, friends, comments. The product's pitch is *private* spite. Adding social undoes that.

---

## Pricing notes

- $9 was chosen as **impulse-buy territory** — buyers don't open a calendar to discuss it.
- After 100 sales, raise to $14 and grandfather everyone in. Common, ethical, increases LTV.
- A "lifetime + cloud sync" tier at $24 is defensible once cloud sync ships.
- A B2B tier (HR teams using SPITE for "exit interview spite tracking" — yes, dark, but real) at $99 with team accounts is a future option. Wait until you've shipped 500 individual sales first.
- **Never** introduce a $/mo tier. The whole point of SPITE's pitch is "not a subscription."

---

## Legal / housekeeping

- **Privacy policy**: copy this verbatim into a `/privacy.html` page or modal: *"SPITE has no servers, no analytics, no cookies, no email list, no third-party tracking. All data is stored in your browser's localStorage. License keys are verified by a single CORS POST to api.gumroad.com when you paste a key. That's the only request this site makes to anyone besides itself."*
- **Terms**: keep them similarly tiny. Or skip them — Gumroad provides ToS for the transaction itself.
- **Refunds**: 7 days, no questions, processed via Gumroad. State this on the Pro modal (already there).

---

## When the receipts hit Twitter

That's the goal. The watermark on free-tier receipts says `made with SPITE · spite.lol`. Every viral grievance becomes an ad. This is the whole growth model. Do not remove the watermark from the free tier.

— management (it's just one person and a strong opinion)
