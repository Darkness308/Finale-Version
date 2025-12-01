/**
 * Service Worker - Progressive Web App Support
 * Offline-first Strategy mit intelligenten Caching
 * Version: 2.0.0
 */

const CACHE_VERSION = 'therapy-v2.0.0';
const CACHE_URLS = [
  '/',
  '/therapy-premium.html',
  '/js/app.js',
  '/js/utils.js'
];

// CDN Resources (Cache with Network Fallback)
const CDN_CACHE = 'therapy-cdn-v2.0.0';
const CDN_URLS = [
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js',
  'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
];

// 🎯 Installation - Pre-cache critical resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v2.0.0...');

  event.waitUntil(
    Promise.all([
      caches.open(CACHE_VERSION).then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(CACHE_URLS);
      }),
      caches.open(CDN_CACHE).then(cache => {
        console.log('[SW] Caching CDN resources');
        return cache.addAll(CDN_URLS).catch(err => {
          console.warn('[SW] CDN caching failed (non-critical):', err);
        });
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    })
  );
});

// 🔄 Activation - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v2.0.0...');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_VERSION && name !== CDN_CACHE)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// 📡 Fetch - Offline-First Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Strategy 1: CDN Resources - Cache First, Network Fallback
  if (url.hostname.includes('cdn.jsdelivr.net')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) {
          console.log('[SW] Serving from cache:', url.pathname);
          return cached;
        }

        return fetch(request).then(response => {
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(CDN_CACHE).then(cache => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        }).catch(() => {
          console.warn('[SW] Network failed for CDN resource:', url.pathname);
          return new Response('Offline - CDN resource unavailable', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
    );
    return;
  }

  // Strategy 2: App Shell - Cache First
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        console.log('[SW] Serving from cache:', url.pathname);
        return cached;
      }

      return fetch(request).then(response => {
        // Cache successful responses
        if (response.ok && url.origin === location.origin) {
          const clonedResponse = response.clone();
          caches.open(CACHE_VERSION).then(cache => {
            cache.put(request, clonedResponse);
          });
        }
        return response;
      }).catch(err => {
        console.error('[SW] Fetch failed:', url.pathname, err);

        // Offline fallback page
        if (request.mode === 'navigate') {
          return caches.match('/therapy-premium.html');
        }

        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});

// 📨 Background Sync (for future data sync)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-therapy-data') {
    event.waitUntil(syncTherapyData());
  }
});

async function syncTherapyData() {
  // Placeholder for future backend sync
  console.log('[SW] Syncing therapy data...');
  return Promise.resolve();
}

// 🔔 Push Notifications (optional, for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Neue Nachricht',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    tag: 'therapy-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('Therapie-Arbeitsbuch', options)
  );
});

// 📊 Performance Monitoring
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(names => {
        return Promise.all(names.map(name => caches.delete(name)));
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

console.log('[SW] Service Worker loaded successfully! 🚀');
