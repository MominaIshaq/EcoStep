// service-worker.js
const CACHE_NAME = 'ecostep-v2';
const ASSETS = [
  'index.html','quiz.html','results.html','tips.html','future.html','community.html','about.html','dashboard.html','hub.html','ai-coach.html','photo-estimator.html','culture-faith.html','local-map.html','students.html','marketplace.html','social.html','calendar.html','carbon-diary.html','ecoquiz.html',
  'style.css','script.js','auth.js','dashboard.js','i18n.js','data/ecoquiz.json',
  'neutral.png','logo.png','favicon.svg'
];

// Install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (e) => {
  const req = e.request;

  // Only handle http/https requests → skip chrome-extension://, data:, etc.
  if (!(req.url.startsWith('http://') || req.url.startsWith('https://'))) {
    return;
  }

  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req).then(res => {
        // Only cache valid responses
        if (!res || res.status !== 200 || res.type === 'opaque') {
          return res;
        }

        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match('index.html'));
    })
  );
});
