# Development Rules (SOP)

Seluruh *developer* (baik agen AI maupun tim *engineer* manusia) wajib mengikuti alur kerja berikut secara terstruktur saat menerima tugas baru atau *update* fitur. Aturan ini menjaga konsistensi, menghindari kerja ganda, dan menjamin rilis yang bebas hambatan.

## Standard Development Flow

### 1. Baca PRD (Product Requirements Document)
Sebelum menulis satu baris kode pun, selalu baca spesifikasi pada folder `.prd`. Pastikan Anda memahami struktur respons *endpoint* (API) yang diharapkan dan tipe data yang mengalir (*interfaces*).

### 2. Consume API Sesuai PRD
- Buat atau mutakhirkan *file* API di dalam folder `src/features/<modul>/api/`.
- Deklarasikan *Interface* (*Types*) untuk `Request` dan `Response` secara presisi mengikuti struktur JSON di PRD.
- Ekspor *methods* panggilan `axios` (biasanya dibungkus dalam variabel fungsi seperti `modulNameApi`).

### 3. Bangun UI
- Rancang antarmuka berdasarkan fungsionalitas PRD dan rujuk pada standar visual yang ada di `design.md`.
- Jika ini halaman daftar (List/Tabel), selalu terapkan `DataTable` (baca pedoman integrasinya di `DATATABLE_STANDARDS.md`).

### 4. Test-Data Driven UI (TDD UI)
- Jika *endpoint Backend* belum 100% jadi, dilarang membiarkan antarmuka *blank* atau menunda pekerjaan!
- Pasok *Mock Data* (TDD UI) di dalam komponen. Implementasikan logika filter pencarian atau paginasi secara *client-side* sementara waktu, dan simulasikan *network latency* (waktu muat) dengan `setTimeout`.
- Saat *Backend* diinfokan sudah siap, pengembang hanya perlu menukar *mock fetcher* (contoh: `fetchMockTenants`) menjadi pemanggil API asli (contoh: `platformTenantsApi.getTenants`).

### 5. Update TASK.md
Setiap kali Anda menuntaskan satu modul (termasuk membuat UI mock atau integrasi penuh), Anda **wajib** mencentang statusnya (`⬜` menjadi `✅`) di dalam tabel dokumentasi `TASK.md` di direktori akar. Ini berfungsi sebagai papan penanda sejauh mana progres penyelesaian proyek.

---
**Catatan Penting untuk AI Assistant:** 
Aturan ini harus selalu dicerna dan ditaati dalam setiap percakapan. Jika tidak ada permintaan lain, selalu jadikan kelima poin di atas sebagai urutan aksi sadar (*conscious flow*) ketika mengerjakan fitur.
