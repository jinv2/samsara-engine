self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('samsara-v1').then((cache) => cache.addAll([
      '/',
      '/index.html',
      '/style.css',
      '/app.js',
      '/icon.png'
    ]))
  );
});

self.addEventListener('fetch', (e) => {
  // 如果是 API 请求 (director)，不缓存，直接联网
  if (e.request.url.includes('/.netlify/functions/')) {
    return;
  }
  // 其他静态资源优先读缓存
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
