# SPITE

> Days since they wronged you. Counted.

A petty grudge tracker, sold as a $9 one-time unlock. Static site, zero infrastructure, ~85% net margin after Gumroad/Stripe fees. Vanilla HTML/CSS/JS. No build step. No backend.

- 🖤 brutalist dark UI
- 🔒 100% local — data lives in your browser's `localStorage`, no servers, no analytics, no email list
- 🧾 receipt-card export — generate a 1080×1350 PNG you can post anywhere
- 💸 $9 once via Gumroad. real license verification (CORS POST to `api.gumroad.com`). no subscription.
- 📱 PWA — installable on iOS/Android/desktop, works offline
- ♿ keyboard-accessible — focus trap in modals, escape to close, `n` to add a new grudge

## Quick start (local)

It's a static site. Open `index.html` in any browser, or:

```bash
# any tiny static server works
python3 -m http.server 8080
# then open http://localhost:8080
```

## Wire up Gumroad to go live (~5 minutes)

1. Create a Gumroad product (`SPITE Pro`, $9, license keys ON).
2. Open `app.js`. Set the two values at the top:
   ```js
   const GUMROAD_PERMALINK   = 'spitepro';        // your product slug
   const GUMROAD_PRODUCT_ID  = 'XXXXXXXX...';     // your product id
   ```
3. Re-deploy. Pro now verifies real, non-refunded license keys against Gumroad.

If `GUMROAD_PRODUCT_ID` is empty, the app stays in **demo mode** (accepts any `SPITE-XXXX-XXXX-XXXX` format key). Useful for testing the unlock UI before the product is live.

Full launch playbook: [`LAUNCH.md`](./LAUNCH.md).

## Deploy

Pick any static host. **Cloudflare Pages** is recommended (free, fastest CDN, the included [`_headers`](./_headers) and [`_redirects`](./_redirects) files just work).

- **Cloudflare Pages**: connect this repo → build command **none** → output dir `/`. ~30s.
- **Vercel / Netlify**: same flow, also free.
- **GitHub Pages**: works, slower CDN.

After deploy, set your domain in `index.html` (currently `spite.lol`) and in [`sitemap.xml`](./sitemap.xml).

## Project layout

```
.
├── index.html         landing + tracker + modals
├── styles.css         brutalist dark UI
├── app.js             logic, canvas receipts, gumroad license verification
├── sw.js              service worker (offline-first cache)
├── manifest.webmanifest    PWA manifest
├── icons/             PWA icons
├── og.png             1200×630 social preview
├── privacy.html       privacy policy (the manifesto, in legal form)
├── terms.html         terms (also tiny)
├── 404.html           graceful not-found
├── robots.txt         allow all, point at sitemap
├── sitemap.xml        single-page sitemap
├── _headers           CSP + caching + security (Cloudflare Pages)
├── _redirects         pretty URLs (Cloudflare Pages / Netlify)
├── LAUNCH.md          full launch playbook
└── .github/workflows/ CI: html-validate, stylelint, eslint
```

## Development

```bash
npm install
npm run lint           # eslint + stylelint + html-validate
npm run validate       # all of the above + link check
npm run serve          # local static server on :8080
```

There is **no build step**. The source you commit is the source that ships.

## License

[MIT](./LICENSE) for the code. The brand and the playbook are the moat.

---

made with caffeine and unresolved feelings — management (it's just one person and a strong opinion)
