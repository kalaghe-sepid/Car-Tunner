/* City Tuner service worker: app files = network-first (updates arrive), model files = their own cache that survives app updates, so 28 MB is not re-downloaded on every version */
const V='city-tuner-v10',CV='city-tuner-cars-1bd9d867',APP=["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "icons/maskable-512.png"],CARS=["cars/alfa.txt", "cars/audi.txt", "cars/cherokee.txt", "cars/corvette.txt", "cars/countach.txt", "cars/cutlass.txt", "cars/datsun.txt", "cars/dodge.txt", "cars/ghost.txt", "cars/giotto.txt", "cars/gtr.txt", "cars/house.txt", "cars/impala.txt", "cars/landcruiser.txt", "cars/phoenix.txt", "cars/porsche.txt", "cars/props.txt", "cars/rusty.txt", "cars/skyline.txt", "cars/suv.txt", "cars/terzo.txt", "cars/vaz.txt"];
const add=async(cn,u)=>{const c=await caches.open(cn);if(await c.match(u))return;for(let i=0;i<2;i++){try{await c.add(u);return}catch(e){}}};
self.addEventListener('install',e=>{e.waitUntil((async()=>{for(const f of APP)await add(V,f);for(const f of CARS)await add(CV,f);await self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==CV).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const put=(cn,req,x)=>{if(x&&(x.ok||x.type==='opaque')){const y=x.clone();caches.open(cn).then(c=>c.put(req,y)).catch(()=>{})}return x};
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!=='GET')return;const u=new URL(q.url),same=u.origin===location.origin;
  if(q.mode==='navigate'||(same&&/(^|\/)(index\.html)?$/.test(u.pathname))){
    e.respondWith(Promise.race([fetch(q).then(x=>put(V,'index.html',x)),new Promise((_,rj)=>setTimeout(rj,5000))]).catch(()=>caches.match('index.html').then(r=>r||caches.match('./'))));return}
  const cn=same&&/\/cars\//.test(u.pathname)?CV:V;
  e.respondWith(caches.match(q,{ignoreSearch:true}).then(r=>r||fetch(q).then(x=>put(cn,q,x)).catch(()=>caches.match('index.html'))))});
