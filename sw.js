// 每次修改了 index.html 的代码，只需在这里把 v1 改成 v2、v3... 即可触发用户的静默更新
const CACHE_NAME = 'nce2-plan-v3.2'; 
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 安装时缓存所有核心文件
self.addEventListener('install', (event) => {
  self.skipWaiting(); // 强制立刻接管控制权
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 激活时清理旧版本的缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截网络请求：网络优先，网络失败则使用离线缓存
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // 如果网络请求成功，克隆一份存入缓存以备断网时使用
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => {
        // 如果断网了，从缓存中读取
        return caches.match(event.request);
      })
  );
});
