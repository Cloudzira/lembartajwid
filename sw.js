const SC="tajwid-shell-v3",TC="tajwid-tiles-v3",FC="tajwid-fonts-v3";
const CORE=["./", "index.html", "manifest.webmanifest", "icons/icon.svg", "icons/favicon.svg", "icons/favicon-32.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png", "img/halaman-1.webp", "img/halaman-2.webp"];
const L1=["t/1/1/0_0.webp", "t/1/1/1_0.webp", "t/1/1/2_0.webp", "t/1/1/3_0.webp", "t/1/1/4_0.webp", "t/1/1/5_0.webp", "t/1/1/6_0.webp", "t/1/1/7_0.webp", "t/1/1/0_1.webp", "t/1/1/1_1.webp", "t/1/1/2_1.webp", "t/1/1/3_1.webp", "t/1/1/4_1.webp", "t/1/1/5_1.webp", "t/1/1/6_1.webp", "t/1/1/7_1.webp", "t/1/1/0_2.webp", "t/1/1/1_2.webp", "t/1/1/2_2.webp", "t/1/1/3_2.webp", "t/1/1/4_2.webp", "t/1/1/5_2.webp", "t/1/1/6_2.webp", "t/1/1/7_2.webp", "t/1/1/0_3.webp", "t/1/1/1_3.webp", "t/1/1/2_3.webp", "t/1/1/3_3.webp", "t/1/1/4_3.webp", "t/1/1/5_3.webp", "t/1/1/6_3.webp", "t/1/1/7_3.webp", "t/1/1/0_4.webp", "t/1/1/1_4.webp", "t/1/1/2_4.webp", "t/1/1/3_4.webp", "t/1/1/4_4.webp", "t/1/1/5_4.webp", "t/1/1/6_4.webp", "t/1/1/7_4.webp", "t/2/1/0_0.webp", "t/2/1/1_0.webp", "t/2/1/2_0.webp", "t/2/1/3_0.webp", "t/2/1/4_0.webp", "t/2/1/5_0.webp", "t/2/1/6_0.webp", "t/2/1/7_0.webp", "t/2/1/0_1.webp", "t/2/1/1_1.webp", "t/2/1/2_1.webp", "t/2/1/3_1.webp", "t/2/1/4_1.webp", "t/2/1/5_1.webp", "t/2/1/6_1.webp", "t/2/1/7_1.webp", "t/2/1/0_2.webp", "t/2/1/1_2.webp", "t/2/1/2_2.webp", "t/2/1/3_2.webp", "t/2/1/4_2.webp", "t/2/1/5_2.webp", "t/2/1/6_2.webp", "t/2/1/7_2.webp", "t/2/1/0_3.webp", "t/2/1/1_3.webp", "t/2/1/2_3.webp", "t/2/1/3_3.webp", "t/2/1/4_3.webp", "t/2/1/5_3.webp", "t/2/1/6_3.webp", "t/2/1/7_3.webp", "t/2/1/0_4.webp", "t/2/1/1_4.webp", "t/2/1/2_4.webp", "t/2/1/3_4.webp", "t/2/1/4_4.webp", "t/2/1/5_4.webp", "t/2/1/6_4.webp", "t/2/1/7_4.webp"];
self.addEventListener("install",e=>{e.waitUntil((async()=>{
 await (await caches.open(SC)).addAll(CORE);
 const t=await caches.open(TC);await Promise.allSettled(L1.map(u=>t.add(u)));
 await self.skipWaiting()})())});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>![SC,TC,FC].includes(x)).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
 const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
 if(u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com"){
  e.respondWith(caches.open(FC).then(c=>c.match(r).then(h=>{const n=fetch(r).then(x=>{c.put(r,x.clone());return x}).catch(()=>h);return h||n})));return}
 if(u.origin!==location.origin)return;
 if(r.mode==="navigate"){
  e.respondWith(caches.open(SC).then(c=>c.match("index.html").then(h=>{const n=fetch(r).then(x=>{if(x.ok)c.put("index.html",x.clone());return x}).catch(()=>h);return h||n})));return}
 e.respondWith(caches.match(r).then(h=>h||fetch(r).then(x=>{if(x.ok){const y=x.clone();caches.open(u.pathname.includes("/t/")?TC:SC).then(c=>c.put(r,y))}return x})))});
