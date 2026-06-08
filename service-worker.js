const CACHE_NAME = "test-content-catching-v4";

const CORE_FILES = [
    "./",
    "./index.html",
    "./manifest.json"
];

self.addEventListener("install", function (event) {
    console.log("[Service Worker] Installing:", CACHE_NAME);

    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(CORE_FILES);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", function (event) {
    console.log("[Service Worker] Activating:", CACHE_NAME);

    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

self.addEventListener("fetch", function (event) {
    if (event.request.method !== "GET") return;

    const requestUrl = new URL(event.request.url);

    if (requestUrl.origin !== self.location.origin) return;

    const isAddressableFile = requestUrl.pathname.includes("/ServerData/");
    const isUnityBuildFile = requestUrl.pathname.includes("/Build/");
    const isTemplateFile = requestUrl.pathname.includes("/TemplateData/");

    event.respondWith(
        caches.match(event.request).then(function (cachedResponse) {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then(function (networkResponse) {
                if (networkResponse && networkResponse.status === 200) {
                    if (isAddressableFile || isUnityBuildFile || isTemplateFile || requestUrl.pathname.endsWith(".html")) {
                        const responseClone = networkResponse.clone();

                        caches.open(CACHE_NAME).then(function (cache) {
                            cache.put(event.request, responseClone);
                        });
                    }
                }

                return networkResponse;
            }).catch(function () {
                return caches.match("./index.html");
            });
        })
    );
});