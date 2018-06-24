// @ts-check

const CACHE_NAME = 'jiayihu-static-v4';
const DATA_CACHE_NAME = 'jiayihu-data-v2';
const urlsToCache = ['/', '/css/main.css', '/css/prism.css', '/js/main.js', '/js/prism.js'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Opened cache');

      // Atomic operation, if any file fails the entire cache operation fails
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  console.log('[ServiceWorker] activating.');

  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  return self.clients.claim();
});

/**
 * Only after first install, on second reload
 */
self.addEventListener('fetch', event => {
  /** @type {Request} */
  const request = event.request;

  if (request.url.includes('api.github.com')) {
    // "Cache then network" strategy for API requests
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(request).then(response => {
          cache.put(request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    /**
     * "Cache, falling back to the network" for static file requests.
     * @NOTE: this causes Chrome Network Devtools to show "from ServiceWorker"
     * even though the resource is actually fetched from server
     */
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request);
      })
    );
  }
});
