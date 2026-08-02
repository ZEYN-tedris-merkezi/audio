const STATIC_CACHE = 'zeyn-static-v7';
const AUDIO_CACHE = 'zeyn-audio-v7';

const STATIC_ASSETS = [
  'index.html',
  'movers.html',
  'starters.html',
  'flyers.html',
  'styles.css',
  'app.js',
  'manifest.webmanifest',
  'favicon.png',
  'zeyn-logo.png',
  'zeyn-brand-photo.jpg',
  'test01.html',
  'test02.html',
  'test03.html',
  'test04.html',
  'test05.html',
  'test06.html',
  'test07.html',
  'test08.html',
  'test09.html',
  'test10.html',
  'test11.html',
  'test12.html',
  'test13.html',
  'test14.html',
  'test15.html',
  'test16.html',
  'test17.html',
  'test18.html',
  'test19.html',
  'test20.html',
  'test21.html',
  'test22.html',
  'test23.html',
  'test24.html',
  'test25.html',
  'test26.html',
  'test27.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => ![STATIC_CACHE, AUDIO_CACHE].includes(key))
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.pathname.toLowerCase().endsWith('.mp3')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async cache => {
        const cached = await cache.match(event.request);
        if (cached) return cached;

        return fetch(event.request);
      })
    );
    return;
  }

  const isHtml =
    event.request.mode === 'navigate' ||
    url.pathname.toLowerCase().endsWith('.html') ||
    url.pathname.endsWith('/');

  if (isHtml) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches
              .open(STATIC_CACHE)
              .then(cache => cache.put(event.request, copy));
          }

          return response;
        })
        .catch(() =>
          caches
            .match(event.request)
            .then(cached => cached || caches.match('index.html'))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches
            .open(STATIC_CACHE)
            .then(cache => cache.put(event.request, copy));
        }

        return response;
      });
    })
  );
});

self.addEventListener('message', event => {
  const data = event.data || {};
  const port = event.ports?.[0];

  if (data.type === 'CACHE_AUDIO') {
    event.waitUntil(
      (async () => {
        try {
          const response = await fetch(data.url, { cache: 'no-store' });

          if (!response.ok) {
            throw new Error('Audio download failed');
          }

          const cache = await caches.open(AUDIO_CACHE);
          await cache.put(data.url, response.clone());

          port?.postMessage({ ok: true });
        } catch (err) {
          port?.postMessage({
            ok: false,
            error: String(err.message || err)
          });
        }
      })()
    );
  }

  if (data.type === 'IS_AUDIO_CACHED') {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(AUDIO_CACHE);
        const match = await cache.match(data.url);

        port?.postMessage({
          ok: true,
          cached: !!match
        });
      })()
    );
  }
});