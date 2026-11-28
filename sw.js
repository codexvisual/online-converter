/* Online Converter — service worker (offline-first, caches libraries too) */
const CACHE = 'oc-shell-v28';
const CORE = [
  './', './index.html', './css/style.css', './css/studio.css', './js/app.js', './js/i18n.js', './js/image-tools.js', './js/image-utils.js', './js/image-studio.js',
  './about/', './contact/', './privacy-policy/', './terms/', './security/', './cookies/', './blog/', './press/', './studio/', './404.html', './sitemap.xml',
  './manifest.json',
  './assets/logo-small.png', './assets/favicon.png',
  './assets/icon-192.png', './assets/icon-512.png',
  './assets/fontawesome/css/all.min.css',
  './assets/fontawesome/webfonts/fa-solid-900.woff2',
  './assets/fontawesome/webfonts/fa-brands-400.woff2',
  './assets/fonts/inter-latin.woff2',
  './assets/vendor/pdf-lib-encrypt.js'
];

/* Third-party libraries are cached too, so the tools work offline. */
const LIBS = [
  'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
  'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
  'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js',
  'https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.iife.js',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js',
  'https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js',
  'https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
  'https://cdn.jsdelivr.net/npm/gifenc@1.0.3/dist/gifenc.esm.js',
  'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js',
  'https://cdn.jsdelivr.net/npm/utif@3.1.0/UTIF.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.allSettled(CORE.map((u) => cache.add(u).catch(() => {})));
    // Cache with CORS mode so SRI integrity checks on <script crossorigin> succeed.
    await Promise.allSettled(LIBS.map((u) => cache.add(new Request(u, { mode: 'cors', credentials: 'omit' })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) {
    // Network-first for libraries (keeps SRI valid); cached CORS copy is offline fallback.
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }
  // Network-first for our own files, with offline cache fallback.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => {
        if (hit) return hit;
        if (req.mode === 'navigate') return caches.match('./index.html');
        return undefined;
      }))
  );
});
