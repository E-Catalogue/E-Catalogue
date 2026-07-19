# Deploy ke Vercel — GM Mobilindo E-Catalogue

Panduan deploy frontend (Vite + React 19 + TS) ini ke Vercel.

> **Build kamu jalankan sendiri.** Dokumen ini fokus ke persiapan + langkah; perintah build cukup dipakai untuk verifikasi lokal sebelum push.

---

## 0. Ringkasan cepat

| Item | Nilai |
|------|-------|
| Framework Preset | **Vite** (auto-detect) |
| Build Command | `npm run build` (`tsc -b && vite build`) |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node.js Version | **22.x** (atau 20.x) |
| SPA Rewrite | sudah ada di [`vercel.json`](vercel.json) ✅ |
| Env wajib | `VITE_API_BASE_URL` |

---

## 1. ⚠️ Prasyarat PENTING — Backend harus publik & HTTPS

Frontend di Vercel berjalan di **HTTPS** dan diakses dari **internet**. Saat ini `.env` menunjuk ke IP LAN privat:

```
VITE_API_BASE_URL=http://10.105.124.244:3000/api/v1
```

Alamat `10.x.x.x` hanya bisa diakses di jaringan lokal — **browser pengunjung tidak akan bisa menjangkaunya**. Selain itu, halaman HTTPS **tidak boleh** memanggil API `http://` (diblokir browser sebagai *mixed content*).

Sebelum deploy, backend harus:

1. **Punya URL publik** (domain/subdomain, bukan IP LAN). Contoh: `https://api.gmmobilindo.com`.
2. **Pakai HTTPS** (sertifikat valid).
3. **Mengizinkan CORS** dari domain Vercel kamu, contoh origin:
   - `https://<nama-project>.vercel.app`
   - dan domain preview `https://<nama-project>-*.vercel.app` bila perlu.
   - serta domain custom bila dipasang.
4. **Cookie/refresh token** (kalau pakai cookie lintas domain): set `SameSite=None; Secure` dan CORS `credentials: true`. *(Proyek ini menyimpan token via header Bearer, jadi umumnya cukup CORS biasa — sesuaikan dengan implementasi backend.)*

> Kalau backend belum punya URL publik, opsi: pasang reverse proxy (Nginx/Caddy) + domain, atau gunakan tunneling (Cloudflare Tunnel) untuk sementara.

---

## 2. Environment Variables di Vercel

`.env` **tidak ikut ter-commit** (sudah di-`.gitignore`), jadi nilainya **wajib** dimasukkan manual di Vercel.

Dashboard Vercel → **Project** → **Settings** → **Environment Variables**, tambahkan:

| Key | Value (contoh) | Environment |
|-----|----------------|-------------|
| `VITE_API_BASE_URL` | `https://api.domainmu.com/api/v1` | Production, Preview, Development |

Catatan:
- Prefix **`VITE_`** wajib — hanya variabel berprefix itu yang diekspos ke kode frontend.
- Nilainya **di-inline saat build**, jadi setiap ganti env harus **redeploy** agar berlaku.
- Jangan akhiri dengan `/` ganda; kode sudah memangkas trailing slash, tapi rapikan saja.

---

## 3. Cara deploy

### Opsi A — Lewat Git (paling disarankan)

1. Pastikan repo sudah ada di GitHub/GitLab/Bitbucket dan ter-push.
2. Buka [vercel.com](https://vercel.com) → **Add New… → Project** → **Import** repo ini.
3. Vercel auto-detect **Vite**. Biarkan default:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Buka **Environment Variables**, isi `VITE_API_BASE_URL` (lihat §2).
5. (Opsional) Set **Node.js Version** = 22.x di **Settings → General**.
6. Klik **Deploy**.
7. Setiap `git push` ke branch utama → **Production**; push ke branch lain / PR → **Preview** otomatis.

### Opsi B — Lewat Vercel CLI

```bash
npm i -g vercel        # sekali saja
vercel login
vercel                 # deploy preview (ikuti prompt, set env saat diminta)
vercel --prod          # deploy production
```

Set env via CLI bila perlu:

```bash
vercel env add VITE_API_BASE_URL production
# tempel: https://api.domainmu.com/api/v1
```

---

## 4. Verifikasi build lokal dulu (kamu yang jalankan)

Pastikan build bersih sebelum deploy supaya tidak gagal di Vercel:

```bash
npm install
npm run build      # tsc -b && vite build  → output ke dist/
npm run preview    # cek hasil build di http://localhost:4173
```

Kalau `npm run preview` jalan normal dan halaman + routing OK, build siap di-deploy.

---

## 5. Konfigurasi yang SUDAH ada (tidak perlu diubah)

- [`vercel.json`](vercel.json) — SPA fallback agar refresh di route dalam (mis. `/master/investor`) tidak 404, ditambah `cleanUrls` dan `trailingSlash` untuk optimasi SEO:

  ```json
  {
    "cleanUrls": true,
    "trailingSlash": false,
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

  Rewrite ini **hanya** berlaku untuk path yang bukan file statis, jadi aset di `/assets/*` tetap tersaji normal.

---

## 6. (Opsional) Pin versi Node agar konsisten

Vercel & lokal sebaiknya pakai versi Node yang sama. Pilih salah satu:

- Tambah file **`.nvmrc`** berisi `22`, atau
- Tambah ke `package.json`:

  ```json
  "engines": { "node": "22.x" }
  ```

Lalu set **Node.js Version 22.x** di Settings Vercel.

---

## 7. Checklist sebelum klik Deploy

- [ ] Backend sudah publik + **HTTPS** + CORS mengizinkan domain Vercel
- [ ] `VITE_API_BASE_URL` diisi di Vercel (Production & Preview) menunjuk URL publik backend
- [ ] `npm run build` sukses di lokal (tidak ada error TS)
- [ ] `npm run preview` — routing & login jalan
- [ ] Repo ter-push ke Git (untuk Opsi A)
- [x] (Opsional) Node version dipin ke 22.x (Sudah disetap via `.nvmrc` dan `package.json`)

---

## 8. Troubleshooting umum

| Gejala | Penyebab | Solusi |
|--------|----------|--------|
| Halaman blank / putih | Aset gagal load / error runtime | Cek Console browser; pastikan build sukses & env benar |
| Refresh di route dalam → 404 | SPA fallback hilang | Pastikan `vercel.json` ada (sudah ✅) |
| Request API gagal (Network/CORS) | Backend tidak publik / CORS belum izinkan domain Vercel | Buka backend ke publik + atur CORS origin |
| "Mixed Content" di Console | API masih `http://` sedang frontend `https://` | Backend wajib HTTPS |
| Login berhasil tapi data kosong | `VITE_API_BASE_URL` salah / belum redeploy | Perbaiki env lalu **Redeploy** |
| Build gagal di Vercel padahal lokal OK | Beda versi Node | Pin Node 22.x (lihat §6) |
| Perubahan env tidak berefek | Env di-inline saat build | **Redeploy** setelah ubah env |

---

> Setelah deploy berhasil, akses domain `*.vercel.app`, login, dan pastikan menu (termasuk modul Master Data) memanggil API publik dengan benar.
