/* Service worker — Bình Dương & Hồng Vân wedding invitation
   App-shell precache; network-first for everything else.
   Subpath-safe: all URLs are relative to this file / the registration scope,
   and the worker only touches requests and caches that belong to this site. */

const CACHE_PREFIXES = ['wedding-invitation-', 'wedding-dv-'];
const CACHE_VERSION = 'wedding-invitation-v11';
const PRECACHE_PATHS = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './manifest.json',
  './assets/qr-nha-hang.png',
  './assets/qr-nha-trai.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon.svg',
];
// Resolve against the worker script URL so the list works at any mount path.
const PRECACHE_URLS = PRECACHE_PATHS.map((p) => new URL(p, self.location.href).href);

function scopeUrl() {
  return (self.registration && self.registration.scope) || new URL('./', self.location.href).href;
}

function isOwnCache(key) {
  return CACHE_PREFIXES.some((prefix) => key.startsWith(prefix));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          // Only prune this site's old caches; other pages on the same origin keep theirs.
          keys.filter((key) => isOwnCache(key) && key !== CACHE_VERSION).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // cross-origin (fonts): straight to network
  if (!url.href.startsWith(scopeUrl())) return; // outside this site's scope: never touch

  // Navigations may carry a guest query (?khach=...): the HTML is identical,
  // so cache it under the bare path and match offline with ignoreSearch.
  const isNav = request.mode === 'navigate';
  const cacheKey = isNav ? url.origin + url.pathname : request;
  const fallbackUrl = new URL('./index.html', scopeUrl()).href;

  // Network-first: cached copy only when network fails.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(cacheKey, copy));
        }
        return response;
      })
      .catch(() =>
        caches.open(CACHE_VERSION).then((cache) =>
          cache
            .match(request, { ignoreSearch: isNav })
            .then((cached) => cached || (isNav ? cache.match(fallbackUrl) : undefined))
            .then((cached) => cached || Response.error())
        )
      )
  );
});
