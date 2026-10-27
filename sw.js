const C='tudy-v16',A=['./','index.html','manifest.webmanifest','icons/favicon-64.png','icons/apple-touch-icon.png','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x)))).then(()=>clients.claim()))});
const put=(req,r)=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(C).then(c=>c.put(req,cp))}return r};
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!=='GET')return;
 // Supabase (login e dati) non passa mai dalla cache: deve essere sempre aggiornato.
 if(/\.supabase\.co$/.test(new URL(q.url).hostname))return;
 // Pagina: prima la rete (così gli aggiornamenti arrivano subito), poi la cache se sei offline.
 if(q.mode==='navigate'){e.respondWith(fetch(q).then(r=>put(q,r)).catch(()=>caches.match(q).then(h=>h||caches.match('index.html'))));return}
 // Resto (icone, librerie, font): prima la cache, aggiornata in background.
 e.respondWith(caches.match(q).then(hit=>{const net=fetch(q).then(r=>put(q,r)).catch(()=>hit);return hit||net}))});
// Tocco su una notifica: riporta in primo piano tudy (o la apre se è chiusa).
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if('focus'in c)return c.focus()}return clients.openWindow('./')}))});
// Notifica dal server (anche ad app chiusa): la mostra sul telefono.
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(x){d={body:e.data?e.data.text():''}}
 e.waitUntil(self.registration.showNotification(d.title||'tudy',{body:d.body||'',icon:'icons/icon-192.png',tag:d.tag||'tudy',renotify:false,data:{url:d.url||'./'}}))});
