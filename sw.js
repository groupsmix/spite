/* SPITE service worker — offline-first cache for the static shell.
 *
 * Strategy:
 *  - Pre-cache the app shell (HTML/CSS/JS/manifest/icons) on install.
 *  - For navigations and same-origin GETs: cache-first, then network, with
 *    a network update in the background ("stale-while-revalidate").
 *  - Never cache requests to api.gumroad.com — license verification must
 *    always hit the network so refunds revoke access.
 *  - Bump CACHE_VERSION when shipping a new version of the static files.
 */
const CACHE_VERSION = 'spite-v1';
const SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.webmanifest',
  '/og.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/privacy.html',
  '/terms.html',
  '/404.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never intercept Gumroad license verification.
  if (url.hostname === 'api.gumroad.com') return;

  // Cross-origin GETs (fonts, etc.) — let the browser handle them.
  if (url.origin !== self.location.origin) return;

  // Navigation requests: serve cached index, fall back to network, then 404.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match(req).then((r) => r || caches.match('/index.html')).then((r) => r || caches.match('/404.html'))
      )
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  event.respondWith(
    caches.open(CACHE_VERSION).then((cache) =>
      cache.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((res) => {
            if (res && res.status === 200 && res.type === 'basic') cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    )
  );
});
