// ── Firebase Messaging (background push notifications) ────────────────────────
importScripts('https://www.gstatic.com/firebasejs/11.4.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.4.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBwDwvEmDyrXoR3DAGesHmxpJsflWV6Wng",
  authDomain: "together-8ed20.firebaseapp.com",
  projectId: "together-8ed20",
  storageBucket: "together-8ed20.firebasestorage.app",
  messagingSenderId: "252730649815",
  appId: "1:252730649815:web:4710d0e2c3fc501f02d492",
});

const messaging = firebase.messaging();

// Показывать уведомление когда приложение свёрнуто / закрыто
messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'Вместе', {
    body: body || '',
    icon: './icon.svg',
    badge: './icon.svg',
    data: payload.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: false,
  });
});

// ── PWA Cache ─────────────────────────────────────────────────────────────────
const CACHE = 'vmeste-v3';
const ASSETS = ['./index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const data = e.notification.data || {};
  const url = './' + (data.payload ? '?open=' + data.type + ':' + data.payload : '');
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes('sigmadaa.github.io'));
      if (existing) { existing.focus(); return; }
      return clients.openWindow('./');
    })
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
