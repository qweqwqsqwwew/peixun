'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "690491838a88638f76e9443644d87d9b",
"index.html": "506644554225be4c013347230d7291fc",
"/": "506644554225be4c013347230d7291fc",
"main.dart.js": "0a84bd3cff3c99d34f834482b20a7a44",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "eaf08099a93b6dd0787ffb2709744926",
"assets/asset/images/home/gonggao.png": "1a0fb3bf97960ea72d00a8dfa945adb8",
"assets/asset/images/home/lilunmoni.png": "f7da51f3bedeed35effb6d50881d9e80",
"assets/asset/images/home/weiketang.png": "84f6fa6e97e4574c65f5e9600feaa6ed",
"assets/asset/images/home/richeng.png": "4138053716ba7e86cd0edab3d3947a64",
"assets/asset/images/home/koufenjia.png": "c572dde1a42737bdd7bdba0f4a5af1e3",
"assets/asset/images/home/saoQR.png": "8311f696f07504d961db4cda990c9274",
"assets/asset/images/home/pinglun.png": "ce3ff0c3d4280f44bbf310b60fe18ed8",
"assets/asset/images/home/peixunguanli.png": "5ff6e74e5e8047c702ec708c7ff411ee",
"assets/asset/images/home/signsuccess.png": "39158fe67b178f06e974852ae698e248",
"assets/asset/images/home/chakan.png": "875e9e13da5b7c5d4bbaae6565c2f20e",
"assets/asset/images/home/dianzan.png": "875d8a80a722519e9a064008437007bc",
"assets/asset/images/home/kaoheguanli.png": "b17e7f346707c356943440accaf8fba6",
"assets/asset/images/tabbar/tabbar_home_select.png": "63512c8f5b4023e045e4cf81cb400b08",
"assets/asset/images/tabbar/tabbar_home.png": "90fd77636ebc8a5b1c111002cc8f5782",
"assets/asset/images/tabbar/tabbar_mine.png": "cc2342a657d80bca132f0cdc86922776",
"assets/asset/images/tabbar/tabbar_contact.png": "26572a9de3792c6b086cf1479e1c945b",
"assets/asset/images/tabbar/tabbar_contact_select.png": "d981db803d64bf90db841db3837a0437",
"assets/asset/images/tabbar/tabbar_mine_select.png": "d07c5721d65bd320ca3c9d91af5511ec",
"assets/asset/images/tabbar/tabbar_message.png": "d9fc2183a28923f6af5cecf20de32a31",
"assets/asset/images/tabbar/tabbar_message_select.png": "812d0dd5b4ebf89f8368f37a9c610b7b",
"assets/asset/images/updateVersion/header/up_header.png": "e37eda5965f4d9dc189124f60a982805",
"assets/asset/images/updateVersion/header/1.5x/up_header.png": "0d83775571e35af73e61e2d7c9dfb37a",
"assets/asset/images/updateVersion/header/3.0x/up_header.png": "a727f9b980e6240bbff4ec1af669b765",
"assets/asset/images/updateVersion/header/4.0x/up_header.png": "ef954809721096f05f15f2ac1f8e9850",
"assets/asset/images/updateVersion/header/1.0x/up_header.png": "50dc7102f4954e518625c9240b25e8fc",
"assets/asset/images/updateVersion/header/2x/up_header.png": "e37eda5965f4d9dc189124f60a982805",
"assets/AssetManifest.json": "464d7cc25cd59288978a4cc166b15684",
"assets/NOTICES": "f30bb5cdb79b8c9e2369a13ad895ec43",
"assets/FontManifest.json": "7b2a36307916a9721811788013e65289",
"assets/fonts/MaterialIcons-Regular.otf": "a68d2a28c526b3b070aefca4bac93d25"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list, skip the cache.
  if (!RESOURCES[key]) {
    return event.respondWith(fetch(event.request));
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    return self.skipWaiting();
  }
  if (event.message === 'downloadOffline') {
    downloadOffline();
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
