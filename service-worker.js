{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const CACHE_NAME = "unity-webxr-pwa-cache-v1";\
\
const CORE_FILES = [\
  "./",\
  "./index.html",\
  "./manifest.json"\
];\
\
self.addEventListener("install", function (event) \{\
  console.log("[Service Worker] Installing...");\
\
  event.waitUntil(\
    caches.open(CACHE_NAME).then(function (cache) \{\
      return cache.addAll(CORE_FILES);\
    \})\
  );\
\
  self.skipWaiting();\
\});\
\
self.addEventListener("activate", function (event) \{\
  console.log("[Service Worker] Activating...");\
\
  event.waitUntil(\
    caches.keys().then(function (cacheNames) \{\
      return Promise.all(\
        cacheNames.map(function (cacheName) \{\
          if (cacheName !== CACHE_NAME) \{\
            return caches.delete(cacheName);\
          \}\
        \})\
      );\
    \}).then(function () \{\
      return self.clients.claim();\
    \})\
  );\
\});\
\
self.addEventListener("fetch", function (event) \{\
  if (event.request.method !== "GET") \{\
    return;\
  \}\
\
  const requestUrl = new URL(event.request.url);\
\
  if (requestUrl.origin !== self.location.origin) \{\
    return;\
  \}\
\
  event.respondWith(\
    caches.match(event.request).then(function (cachedResponse) \{\
      if (cachedResponse) \{\
        return cachedResponse;\
      \}\
\
      return fetch(event.request).then(function (networkResponse) \{\
        if (\
          networkResponse &&\
          networkResponse.status === 200\
        ) \{\
          const responseClone = networkResponse.clone();\
\
          caches.open(CACHE_NAME).then(function (cache) \{\
            cache.put(event.request, responseClone);\
          \});\
        \}\
\
        return networkResponse;\
      \}).catch(function () \{\
        return caches.match("./index.html");\
      \});\
    \})\
  );\
\});}