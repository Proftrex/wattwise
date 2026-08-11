const CACHE_NAME = "wattwise-cache-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./scripts.js",
  "./manifest.json"
];


// INSTALL SERVICE WORKER
self.addEventListener(
  "install",
  function(event) {

    console.log(
      "WattWise Service Worker Installed"
    );

    event.waitUntil(

      caches.open(
        CACHE_NAME
      )
      .then(
        function(cache) {

          return cache.addAll(
            APP_FILES
          );

        }
      )

    );

  }
);


// ACTIVATE SERVICE WORKER
self.addEventListener(
  "activate",
  function(event) {

    console.log(
      "WattWise Service Worker Activated"
    );


    event.waitUntil(

      caches.keys()
      .then(
        function(cacheNames) {

          return Promise.all(

            cacheNames.map(
              function(cacheName) {

                if(
                  cacheName !== CACHE_NAME
                ){

                  return caches.delete(
                    cacheName
                  );

                }

              }
            )

          );

        }
      )

    );

  }
);


// FETCH FILES
self.addEventListener(
  "fetch",
  function(event) {


    event.respondWith(

      caches.match(
        event.request
      )
      .then(
        function(response) {

          return (
            response ||
            fetch(
              event.request
            )
          );

        }
      )

    );

  }
);
