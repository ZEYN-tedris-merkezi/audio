
const STATIC_CACHE='zeyn-static-v3';
const AUDIO_CACHE='zeyn-audio-v3';
const STATIC_ASSETS=["index.html", "styles.css", "app.js", "manifest.webmanifest", "favicon.png", "zeyn-logo.png", "zeyn-brand-photo.jpg", "test01.html", "test02.html", "test03.html", "test04.html", "test05.html", "test06.html", "test07.html", "test08.html", "test09.html", "test10.html", "test11.html", "test12.html", "test13.html", "test14.html", "test15.html", "test16.html", "test17.html", "test18.html", "test19.html", "test20.html", "test21.html", "test22.html", "test23.html", "test24.html", "test25.html", "test26.html", "test27.html"];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache=>cache.addAll(STATIC_ASSETS))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>![STATIC_CACHE,AUDIO_CACHE].includes(k)).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  const url=new URL(req.url);

  if(req.method!=='GET') return;

  // Audio: use cached copy only if the user explicitly downloaded it.
  if(url.pathname.toLowerCase().endsWith('.mp3')){
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async cache=>{
        const cached=await cache.match(req);
        if(cached) return cached;
        return fetch(req);
      })
    );
    return;
  }

  // Static pages/assets: cache-first, then network.
  event.respondWith(
    caches.match(req).then(cached=>cached || fetch(req).then(response=>{
      const copy=response.clone();
      caches.open(STATIC_CACHE).then(cache=>cache.put(req,copy));
      return response;
    }).catch(()=>caches.match('index.html')))
  );
});

self.addEventListener('message',event=>{
  const data=event.data || {};
  const port=event.ports && event.ports[0];

  if(data.type==='CACHE_AUDIO'){
    event.waitUntil((async()=>{
      try{
        const cache=await caches.open(AUDIO_CACHE);
        const response=await fetch(data.url,{cache:'no-store'});
        if(!response.ok) throw new Error('Audio download failed');
        await cache.put(data.url,response.clone());
        port && port.postMessage({ok:true});
      }catch(err){
        port && port.postMessage({ok:false,error:String(err.message||err)});
      }
    })());
  }

  if(data.type==='IS_AUDIO_CACHED'){
    event.waitUntil((async()=>{
      const cache=await caches.open(AUDIO_CACHE);
      const match=await cache.match(data.url);
      port && port.postMessage({ok:true,cached:!!match});
    })());
  }
});
