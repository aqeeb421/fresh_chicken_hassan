const CACHE_NAME = 'fresh-chicken-v1.0.7';
const ASSETS_TO_CACHE = [
    './index.html',
    './products.html',
    './cart.html',
    './checkout.html',
    './orders.html',
    './contact.html',
    './css/styles.css',
    './js/config.js',
    './js/translations.js',
    './js/firebase-db.js',
    './js/products-data.js',
    './js/cart.js',
    './js/orders.js',
    './js/main.js',
    './manifest.json'
];

// Install Event - Pre-cache core assets safely
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE).catch(err => {
                console.warn('Non-fatal pre-cache skip:', err);
            });
        })
    );
});

// Activate Event - Claim clients
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event - Network First with safe fallback
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) {
        return;
    }

    e.respondWith(
        fetch(e.request)
            .then(res => {
                if (res && res.status === 200) {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, clone)).catch(() => {});
                }
                return res;
            })
            .catch(() => caches.match(e.request).then(cached => cached || caches.match('./index.html')))
    );
});
