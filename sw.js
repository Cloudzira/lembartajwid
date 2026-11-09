/* ==========================================================================
   SERVICE WORKER — Lembar Tajwid Tartili
   Tugas: membuat aplikasi bisa dibuka tanpa internet.

   Ada 3 "laci" penyimpanan (cache):
     SHELL_CACHE : kerangka aplikasi (index.html, ikon, gambar halaman)
     TILE_CACHE  : potongan gambar beresolusi tinggi (folder t/)
     FONT_CACHE  : font Google
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. PENGATURAN
   -------------------------------------------------------------------------- */

// Naikkan angka versi SHELL bila index.html / file inti berubah,
// supaya pengguna otomatis mendapat versi baru.
const SHELL_CACHE = "tajwid-shell-v6";

// Nama TILE_CACHE harus sama dengan OFFLINE_CACHE_NAME di index.html.
const TILE_CACHE = "tajwid-tiles-v3";
const FONT_CACHE = "tajwid-fonts-v3";

const ALL_CACHES = [SHELL_CACHE, TILE_CACHE, FONT_CACHE];

// File yang wajib tersimpan agar aplikasi bisa jalan offline
const CORE_FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/favicon.svg",
  "icons/favicon-32.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "icons/apple-touch-icon.png",
  "img/halaman-1.webp",
  "img/halaman-2.webp",
];

// Tile level 1 (zoom sedang) untuk halaman 1 & 2: 8 kolom × 5 baris per halaman.
// Level 2 dan 3 tidak disimpan di awal, tapi tersimpan saat dipakai
// atau lewat tombol "Simpan Offline".
const TILE_COLUMNS = 8;
const TILE_ROWS = 5;

const LEVEL_1_TILES = [];
for (const page of [1, 2]) {
  for (let row = 0; row < TILE_ROWS; row++) {
    for (let column = 0; column < TILE_COLUMNS; column++) {
      LEVEL_1_TILES.push(`t/${page}/1/${column}_${row}.webp`);
    }
  }
}


/* --------------------------------------------------------------------------
   2. INSTALL — simpan file inti saat pertama kali dipasang
   -------------------------------------------------------------------------- */
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    // File inti: bila ada yang gagal, pemasangan dibatalkan (addAll bersifat semua-atau-tidak)
    const shell = await caches.open(SHELL_CACHE);
    await shell.addAll(CORE_FILES);

    // Tile level 1: boleh sebagian gagal (allSettled), tidak membatalkan pemasangan
    const tiles = await caches.open(TILE_CACHE);
    await Promise.allSettled(LEVEL_1_TILES.map((url) => tiles.add(url)));

    // Langsung aktif tanpa menunggu tab lama ditutup
    await self.skipWaiting();
  })());
});


/* --------------------------------------------------------------------------
   3. ACTIVATE — hapus cache versi lama
   -------------------------------------------------------------------------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => !ALL_CACHES.includes(name))
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim()) // ambil alih semua tab yang terbuka
  );
});


/* --------------------------------------------------------------------------
   4. FETCH — menentukan dari mana setiap permintaan dilayani
   -------------------------------------------------------------------------- */
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // --- A. Font Google: tampilkan dari cache dulu, perbarui di latar belakang
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(serveFont(request));
    return;
  }

  // --- B. Sumber dari situs lain: biarkan browser menanganinya
  if (url.origin !== location.origin) return;

  // --- C. Membuka halaman: tampilkan index.html dari cache, perbarui di latar belakang
  if (request.mode === "navigate") {
    event.respondWith(servePage(request));
    return;
  }

  // --- D. File lain (gambar, ikon, tile): cache dulu, bila belum ada ambil dari internet
  event.respondWith(serveStatic(request, url));
});


/* --------------------------------------------------------------------------
   5. STRATEGI PENYAJIAN
   -------------------------------------------------------------------------- */

/** Font: pakai salinan cache bila ada, sambil mengambil versi terbaru untuk lain kali. */
async function serveFont(request) {
  const cache = await caches.open(FONT_CACHE);
  const cached = await cache.match(request);

  const fromNetwork = fetch(request)
    .then((response) => {
      cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached); // offline: pakai cache

  return cached || fromNetwork;
}

/**
 * Halaman utama: tampilkan index.html dari cache (cepat & bisa offline),
 * sambil mengunduh versi terbaru untuk kunjungan berikutnya.
 * Catatan: setelah index.html diperbarui, perubahan baru terlihat
 * pada pemuatan KEDUA — kecuali SHELL_CACHE dinaikkan versinya.
 */
async function servePage(request) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match("index.html");

  const fromNetwork = fetch(request)
    .then((response) => {
      if (response.ok) cache.put("index.html", response.clone());
      return response;
    })
    .catch(() => cached); // offline: pakai cache

  return cached || fromNetwork;
}

/** File biasa: cache dulu; bila belum ada, ambil dari internet lalu simpan. */
async function serveStatic(request, url) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    // Tile (folder /t/) masuk laci tile, sisanya ke laci kerangka
    const cacheName = url.pathname.includes("/t/") ? TILE_CACHE : SHELL_CACHE;
    const copy = response.clone();
    caches.open(cacheName).then((cache) => cache.put(request, copy));
  }
  return response;
}
