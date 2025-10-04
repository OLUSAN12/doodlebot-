const CACHE_NAME = 'doodlebot-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/constants.ts',
  '/services/geminiService.ts',
  '/components/Header.tsx',
  '/components/PromptForm.tsx',
  '/components/ColoringCanvas.tsx',
  '/components/Gallery.tsx',
  '/components/Settings.tsx',
  '/components/ColorPicker.tsx',
  '/components/ToggleSwitch.tsx',
  '/components/icons/SparklesIcon.tsx',
  '/components/icons/MicrophoneIcon.tsx',
  '/components/icons/BrushIcon.tsx',
  '/components/icons/EraserIcon.tsx',
  '/components/icons/UndoIcon.tsx',
  '/components/icons/SaveIcon.tsx',
  '/components/icons/CloseIcon.tsx',
  '/components/icons/SprayIcon.tsx',
  '/components/icons/TrashIcon.tsx',
  '/components/icons/PaintBucketIcon.tsx',
  '/components/icons/PaletteIcon.tsx',
  '/components/icons/OpacityIcon.tsx',
  '/components/icons/CrayonIcon.tsx',
  '/components/icons/RainbowIcon.tsx',
  '/components/icons/LayoutDashboardIcon.tsx',
  '/components/icons/GalleryIcon.tsx',
  '/components/icons/SettingsIcon.tsx',
  '/components/icons/AppIcon.svg',
  // External resources that should be cached
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
      return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // If we get a valid response, cache it.
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
            // fetch failed, maybe offline
            console.error('Fetch failed:', err);
        });

        // Return the cached response if it exists, otherwise wait for the network.
        return response || fetchPromise;
      });
    })
  );
});
