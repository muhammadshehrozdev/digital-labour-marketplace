// Service worker of Digital Labour Marketplace (Batch 4, feature 6). Own code, about 70 lines.
// RULE: only static files are ever cached. API answers (/api/...) and anything private are never
// stored: the service worker does not even look at them, so they always go to the server.
//   - built assets (/assets/*, hashed names), icons, fonts, the manifest: cache first
//   - page loads (navigation): network first; when offline, the cached app shell (index.html)
//   - the team's recorded help clips (/audio/help/..., Batch 5): cache first, so help plays offline.
//     A media element asks for a clip in pieces (Range, status 206), which is never stored: the whole
//     file is fetched once without a Range and kept.
// A new version replaces the old cache on activation.
const VERSION = 'dlm-static-v2';
const SHELL = ['/', '/favicon.svg', '/favicon-32.png', '/manifest.webmanifest', '/icons/icon-192.png'];

const isStatic = (url) =>
  url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/') ||
  /\.(?:woff2?|svg|png|webmanifest)$/.test(url.pathname);
const isClip = (url) => url.pathname.startsWith('/audio/help/') && /\.(?:webm|mp3|m4a|ogg)$/.test(url.pathname);

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Stores a copy only of a plain, successful, public answer.
async function keep(request, response) {
  if (!response || response.status !== 200 || response.type !== 'basic') return;
  if (/no-store|private/i.test(response.headers.get('Cache-Control') ?? '')) return;
  const cache = await caches.open(VERSION);
  await cache.put(request, response.clone());
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return; // never: API answers can be private

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match('/')) ?? Response.error())
    );
    return;
  }

  if (isClip(url)) {
    event.respondWith(
      caches.match(url.pathname).then((cached) => cached ?? fetch(url.pathname).then((response) => {
        event.waitUntil(keep(new Request(url.pathname), response.clone()));
        return response;
      }))
    );
    return;
  }

  if (isStatic(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          event.waitUntil(keep(request, response));
          return response;
        });
      })
    );
  }
});
