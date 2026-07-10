const CACHE_NAME = 'utillitys-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/calculator.html',
  '/password-generator.html',
  '/ortografia.html',
  '/qr-generator.html',
  '/age-calculator.html',
  '/book-search.html',
  '/text-to-speech.html',
  '/url-shortener.html',
  '/imc-calculator.html',
  '/world-clock.html',
  '/resume-generator.html',
  '/about.html',
  '/currency-converter.html',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

// Instalação – cache dos assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Ativação – limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Intercepta requisições – serve do cache, depois da rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});