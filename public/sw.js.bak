// Service Worker for React Recipe App
// Network-first cache strategy

let cache; // holder for open cache
let missingImageUrl = 'images/missing-image.svg';

// EVENTS:

// The install event runs when the service worker is registered
self.addEventListener('install', e => onInstall());

// The activate event runs when the install is done
self.addEventListener('activate', e => onActivate());

// The fetch event runs every time the web page requests a resource
self.addEventListener('fetch', e => e.respondWith(cacher(e.request)));

async function onInstall() {
  // IMPORTANT! - Faster activation:
  self.skipWaiting();

  // Open the cache, if not done already
  cache = cache || await caches.open('recipe-cache-v2');

  // Cache important files initially (skip missing files)
  const filesToCache = [
    '/',
    '/index.html'
  ];
  
  // Only add missing image if it exists
  try {
    const response = await fetch(missingImageUrl);
    if (response.ok) {
      filesToCache.push(missingImageUrl);
    }
  } catch (e) {
    // Skip missing image if it doesn't exist
  }
  
  return cache.addAll(filesToCache);
}

async function onActivate() {
  // IMPORTANT! - Faster activation:
  self.clients.claim();
  
  // Clean up old caches
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => {
      if (cacheName !== 'recipe-cache-v2') {
        return caches.delete(cacheName);
      }
    })
  );
}

// Cache strategy: Network first (get from cache only if no network)
async function cacher(request) {
  // Skip caching for unsupported schemes
  if (!request.url.startsWith('http')) {
    return fetch(request).catch(() => new Response('', { status: 404 }));
  }

  // Skip API requests - let them go directly to the network
  if (request.url.includes('/api/')) {
    return fetch(request);
  }

  // Open the cache, if not done already
  cache = cache || await caches.open('recipe-cache-v2');

  // If we are online fetch from the server
  let response;
  if (navigator.onLine) {
    response = await fetch(request).catch(e => response = null);
  }

  // If we failed to get a server response, use the cache
  if (!response) {
    response = await cache.match(request);
    // failed to get it from cache too?
    response = response || await fallbackResponses(request);
  }

  // Otherwise cache the response, if it is a GET request
  else if (request.method === 'GET') {
    try {
      cache.put(request, response.clone()); // no await needed!
    } catch (e) {
      // Ignore cache errors for unsupported schemes
      console.warn('Cache put failed:', e.message);
    }
  }

  return response;
}

// Try to generate some fallback responses
async function fallbackResponses(request) {
  let response, key, cacheKeys = await cache.keys();
  let base = location.protocol + '//' + location.host + '/';
  let route = request.url.split(base)[1] || '';
  let extension = request.url.slice(-4);

  if (route && !route.includes('/') && !route.includes('.')) {
    // Could be a hard reload of a frontend route in a SPA
    // so send our 'start page' (the frontend router should manage)
    key = cacheKeys.find(({ url }) => url == base);
  }

  if (['.jpg', '.png', '.gif', '.jpeg', '.webp', '.avif'].includes(extension)) {
    // Probably an image we are missing
    // so send our 'missing image' image
    let img = base + missingImageUrl;
    key = cacheKeys.find(({ url }) => url === img);
  }

  response = key && await cache.match(key);
  return response;
}
