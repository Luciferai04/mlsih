const CACHE_NAME = 'travel-app-v1';
const STATIC_CACHE = 'travel-static-v1';
const DYNAMIC_CACHE = 'travel-dynamic-v1';

const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => {
              cache.put(request, responseClone);
            });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Static files - cache first, network fallback
  event.respondWith(
    caches.match(request)
      .then(response => {
        return response || fetch(request)
          .then(fetchResponse => {
            const responseClone = fetchResponse.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(request, responseClone);
              });
            return fetchResponse;
          });
      })
  );
});

// Background sync for offline trip data
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-trips') {
    event.waitUntil(syncTripData());
  }
});

async function syncTripData() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const keys = await cache.keys();
    
    for (const request of keys) {
      if (request.url.includes('/api/trips') && request.method === 'POST') {
        try {
          await fetch(request);
          await cache.delete(request);
        } catch (error) {
          console.log('Failed to sync trip:', error);
        }
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}