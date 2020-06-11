(
  () => {
    const cacheName = 'news-v1';
    const staticAssets = [
      '/',
      '/js/app.js',
      '/js/navbar.js',
      '/js/fallback.json',
      '/styles/styles.css',
      '/styles/bulma.min.css',
      '/images/icones/firefox/firefox-general-64-64.png',
      '/images/icones/chrome/chrome-favicon-16-16.png'
    ];

    self.addEventListener('install', (event) => {
      event.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(staticAssets))
      );
    });

    // self.addEventListener('activate', event => {
    //   //self.clients.claim();
      
    //   event.waitUntil(
    //     // caches.keys().then(cacheNames => {
    //     //   return Promise.all(
    //     //     cacheNames
    //     //       .filter(name => (name.startsWith('news-')))
    //     //       .filter(name => (name !== cacheName))
    //     //       .map(name => caches.delete(name))
    //     //   );
    //     // })
    //     caches.keys().then(function (keys) {
    //       return Promise.all(keys
    //         .filter(function (key) {
    //           return key.indexOf(cacheName) !== 0;
    //         })
    //         .map(function (key) {
    //           return caches.delete(key);
    //         })
    //       );
    //     })
    //   );
    // });

    self.addEventListener('fetch', event => {
      const request = event.request;
      const url = new URL(request.url);
      if (url.origin === location.origin) {
        event.respondWith(cacheFirst(request));
      } else {
        event.respondWith(networkFirst(request));
      }
    });

    // self.addEventListener('fetch', event => {
    //   const request = event.request;
    //   const url = new URL(request.url);
    //   if (url.origin === location.origin) {
    //     event.respondWith(cacheFirst(request));
    //   } else {
    //     // event.respondWith(networkFirst(request));
    //   }
    // });

    async function cacheFirst(request) {
      const cachedResponse = await caches.match(request);
      return cachedResponse || fetch(request);
    }

    async function networkFirst(request) {      
      const dynamicCache = await caches.open(`news-dynamic`);
      try {
        const networkResponse = await fetch(request);
        dynamicCache.put(request, networkResponse.clone());
        return networkResponse;
      } catch (err) {
        const cachedResponse = await dynamicCache.match(request);
        return cachedResponse || await caches.match('/js/fallback.json');
      }
    }
  }
)();