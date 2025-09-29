// service-worker.js
const CACHE_NAME = 'ecostep-v2';
const ASSETS = [
  'index.html','quiz.html','results.html','tips.html','future.html','community.html','about.html','dashboard.html','hub.html','ai-coach.html','photo-estimator.html','culture-faith.html','local-map.html','students.html','marketplace.html','social.html','calendar.html','carbon-diary.html','ecoquiz.html',
  'style.css','script.js','auth.js','dashboard.js','i18n.js','data/ecoquiz.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'
];
self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=> c.addAll(ASSETS)).then(()=> self.skipWaiting()));
});
self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=> Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=> caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e)=>{
  const req = e.request;
  e.respondWith(
    caches.match(req).then(cached=> cached || fetch(req).then(res=>{
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c=> c.put(req, copy));
      return res;
    }).catch(()=> caches.match('index.html')))
  );
}); 