(()=>{var i=self,s=i.clients,r="runtime",a=["./","./index.js","./static/main.css"];i.addEventListener("install",t=>{t.waitUntil(caches.open(r).then(n=>n.addAll(a)).then(()=>i.skipWaiting()))});i.addEventListener("fetch",t=>{(t.request.url.startsWith(self.location.origin)||t.request.url.includes("bootstrap"))&&t.respondWith(caches.match(t.request).then(n=>{let o=()=>fetch(t.request).then(e=>caches.open(r).then(c=>c.put(t.request,e.clone()).then(()=>e)));return n?(o(),n):o()}))});i.addEventListener("push",function(t){var n={icon:"https://benkaiser.github.io/pushups/static/icons/icon-512x512.png",body:"Let's go!"};t.waitUntil(i.registration.showNotification("Pushup Time",n))});i.addEventListener("notificationclick",function(t){t.notification.close();let n=location.origin+location.pathname.replace("service-worker.js","");t.notification.close(),t.waitUntil(s.matchAll().then(o=>{for(let e of o)if(e.url.includes(n))return e.focus();return s.openWindow("/")}))});})();
