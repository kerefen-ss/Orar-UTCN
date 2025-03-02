// Instalare Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('orar-cache-v1').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/style.css',
                '/script.js',
                '/images/icon-192x192.png',
                '/images/icon-512x512.png'
            ]);
        })
    );
});

// Activare Service Worker
self.addEventListener('activate', event => {
    const cacheWhitelist = ['orar-cache-v1'];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptarea cererilor de rețea și servirea din cache
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});
