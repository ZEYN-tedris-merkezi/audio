
const CACHE='zeyn-listening-v2';
const ASSETS=["index.html", "styles.css", "app.js", "manifest.webmanifest", "favicon.png", "zeyn-logo.png", "zeyn-brand-photo.jpg", "test01.html", "test02.html", "test03.html", "test04.html", "test05.html", "test06.html", "test07.html", "test08.html", "test09.html", "test10.html", "test11.html", "test12.html", "test13.html", "test14.html", "test15.html", "test16.html", "test17.html", "test18.html", "test19.html", "test20.html", "test21.html", "test22.html", "test23.html", "test24.html", "test25.html", "test26.html", "test27.html"];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
