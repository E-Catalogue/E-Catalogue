# PRD: Penanganan Error & Data Kosong (Customer Frontend)

> **Tujuan**: Dokumen ini merangkum *brainstorming* dan spesifikasi untuk menangani kondisi tidak ideal di sisi frontend publik (customer), seperti data CMS yang belum di-setup, halaman tidak ditemukan (404), dan gangguan server (500). Hal ini sangat penting untuk SaaS agar aplikasi tidak terlihat rusak (blank screen) di mata end-user.

---

## 1. Penanganan Kondisi Data CMS Kosong (Empty State)

### Masalah Saat Ini
Berdasarkan pengecekan di `LandingPage.tsx`, setiap *section* di-render dengan kondisional seperti ini:
```tsx
{hero?.isVisible !== false && hero && ( ... )}
```
Jika admin SaaS belum mengisi data CMS (seeder belum dijalankan), maka objek `hero` akan *undefined*. Akibatnya, seluruh bagian halaman tidak akan di-render. Website akan terlihat kosong melompong (hanya ada Header dan Footer), memberikan kesan rusak pada website.

### Opsi Solusi (Brainstorming)
* **Opsi A (Dummy Fallback)**: Frontend menyimpan data *dummy* hardcode. Jika API mengembalikan kosong, frontend merender data *dummy*.
  * *Kekurangan*: Pengunjung mungkin melihat teks default "Mobil Bekas Berkualitas" padahal klien menjual jenis mobil berbeda. Kesannya menyesatkan.
* **Opsi B (Maintenance Mode)**: Jika API mengembalikan data CMS kosong (atau struktur belum lengkap), frontend akan menampilkan komponen khusus **"Website Under Construction"** atau "Sedang Dalam Persiapan".
  * *Kelebihan*: Profesional, jelas, dan menghindari salah paham konsumen.
  * *Rekomendasi*: **Opsi B** adalah pilihan terbaik untuk SaaS.

### Spesifikasi Implementasi
1. Buat komponen `EmptyCmsState` (misal dengan gambar ilustrasi perbaikan, dan teks: "Website saat ini sedang dalam penyesuaian konten. Silakan kembali lagi nanti.").
2. Di `LandingPage.tsx`, `AboutPage.tsx`, dsb., tambahkan pengecekan:
   ```tsx
   // Jika data fetch sukses, tapi konten tidak ada
   if (!isLoading && (!hp || Object.keys(hp).length === 0)) {
     return <EmptyCmsState title="Halaman Sedang Dipersiapkan" />;
   }
   ```

---

## 2. Penanganan Halaman Tidak Ditemukan (Error 404 - Not Found)

### Masalah Saat Ini
Jika pelanggan mengunjungi URL yang salah (misal: `/katalog/mobil-asal`), TanStack Router sudah memiliki mekanisme untuk menampilkan halaman 404 (saat ini menggunakan komponen statis di `src/shared/components/NotFound.tsx`).

### Kebutuhan & Spesifikasi (SaaS)
Halaman 404 standar bawaan biasanya terlihat kaku. Halaman ini harus didesain agar tetap ramah bagi pelanggan dan membantu mereka kembali ke jalur yang benar.

**Desain yang Diharapkan:**
1. **Visual**: Menggunakan tema warna aplikasi (dinamis sesuai CSS variables tenant SaaS).
2. **Ilustrasi**: Ikon atau gambar vektor mobil nyasar/rusak (misal ikon `map-pin-off` atau `car-front`).
3. **Teks**: 
   * Judul: "Oops! Kesasar ya?" atau "Halaman Tidak Ditemukan (404)"
   * Sub-judul: "Halaman yang Anda cari mungkin sudah dihapus, atau URL-nya salah."
4. **CTA (Call to Action)**: Tombol utama berbunyi "Kembali ke Beranda" yang mengarah ke `/` dan tombol sekunder "Lihat Katalog" yang mengarah ke `/katalog`.

---

## 3. Penanganan Gangguan Server / API Down (Error 500)

### Masalah Saat Ini
Ketika server backend mati atau gagal mengembalikan response (misal HTTP 500), React Query akan menandai status sebagai `isError`. Jika hal ini tidak ditangkap dengan Error Boundary, website bisa blank atau mem-freeze UI dengan *loading* berputar tanpa akhir.

### Spesifikasi Implementasi
1. Gunakan mekanisme **Error Boundary** dari TanStack Router atau React Query.
2. Buat komponen `GlobalErrorFallback`.
3. **Desain UI Error 500**:
   * **Visual**: Tema bersih dengan peringatan ramah.
   * **Ilustrasi**: Ikon Server Error (misal ikon `server-crash` atau `wrench`).
   * **Teks**: "Mohon Maaf, Ada Gangguan Sistem" dan sub-judul "Server kami sedang mengalami kendala atau sedang dalam pemeliharaan rutin. Tim kami sedang menanganinya."
   * **CTA**: Tombol "Coba Lagi" (me-refresh halaman) dan nomor bantuan (WA Hotline) jika hal ini sangat mendesak.

---

## Kesimpulan & Action Item

Untuk mencapai standar produksi SaaS yang tangguh, tim Frontend perlu menambahkan 3 komponen UI baru:
1. `EmptyCmsState.tsx` (Untuk antisipasi belum ada data CMS/Tenant baru)
2. `CustomerNotFound.tsx` (Update dari NotFound.tsx yang sudah ada agar lebih ramah pelanggan dan menyesuaikan tema)
3. `CustomerServerError.tsx` (Sebagai Error Boundary jika API backend sedang mati/error)

Dokumen ini bisa menjadi acuan *task* selanjutnya setelah seeder API berhasil dijalankan.
