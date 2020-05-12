/** @type {ServiceWorkerGlobalScope} */
var _self = self;

const CACHE_STATIC = "jiayihu-static-v1";
const CACHE_IMAGES = "jiayihu-images-v1";
const CACHE_PAGES = "jiayihu-pages-v1";
const CACHE_NAMES = [CACHE_STATIC, CACHE_IMAGES, CACHE_PAGES];

const staticUrlsToCache = [
  "/offline.html",
  "/manifest.json",

  "/css/main.css",
  "/css/prism.css",
  "https://fonts.googleapis.com/css?family=Merriweather:400,400i,700",

  "/js/main.js",
  "/js/prism.js",
  "https://polyfill.io/v3/polyfill.min.js?features=default%2Cfetch",
];

_self.addEventListener("install", (event) => {
  _self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      return Promise.all(
        staticUrlsToCache.map((url) =>
          cache.add(url).catch((error) => {
            console.log("Failed to add", url, "to the cache", error);
          })
        )
      );
    })
  );
});

_self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((cacheKey) => {
          if (!CACHE_NAMES.includes(cacheKey)) return caches.delete(cacheKey);

          return Promise.resolve(null);
        })
      ).then(() => _self.clients.claim());
    })
  );
});

/**
 * Only after first install, on second reload
 */
_self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== location.origin) return;

  const imagesRegxp = /(\.(png|jpeg|svg|ico))$/;
  if (imagesRegxp.test(request.url)) {
    // Stale-while-revalidate
    return event.respondWith(staleWhileRevalidate(CACHE_IMAGES, request));
  }

  const isHome = url.pathname === "/";
  if (isHome) {
    // Network then cache if offline
    return event.respondWith(
      networkFallbackCache(CACHE_PAGES, request).catch(() =>
        caches.match("/offline.html")
      )
    );
  }

  const isHTML = request.mode === "navigate";
  if (isHTML) {
    return event.respondWith(
      staleWhileRevalidate(CACHE_PAGES, request).catch((error) => {
        console.log("Failed to fetch", request.url, error);
        return caches.match("/offline.html");
      })
    );
  }

  /**
   * "Cache, falling back to the network" as default strategy
   * @NOTE: this causes Chrome Network Devtools to show "from ServiceWorker"
   * even though the resource is actually fetched from server
   */
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});

self.addEventListener("message", (message) => {
  const data = message.data;

  switch (data.type) {
    case "TRIM_CACHE":
      trimCache(CACHE_IMAGES, 50);
      break;
    default:
      break;
  }
});

function staleWhileRevalidate(cacheName, request) {
  return caches.open(cacheName).then((cache) => {
    return cache.match(request).then((response) => {
      const fetchRequest = fetch(request).then((fetchResponse) => {
        cache.put(request, fetchResponse.clone());

        return fetchResponse;
      });

      return response || fetchRequest;
    });
  });
}

function networkFallbackCache(cacheName, request) {
  return caches.open(cacheName).then((cache) => {
    return fetch(request)
      .then((response) => {
        cache.put(request, response.clone());

        return response;
      })
      .catch((error) => {
        console.log("Failed to fetch", request.url, error);

        return cache.match(request).then((response) => {
          if (!response) return Promise.reject(null);

          return response;
        });
      });
  });
}

function trimCache(cacheName, limit) {
  return caches.open(cacheName).then((cache) => {
    return cache.keys().then((requests) => {
      if (requests.length <= limit) return null;

      return Promise.all(
        requests.slice(0, limit).map((request) => cache.delete(request))
      );
    });
  });
}
