# PRD — Standar Struktur File dan Penulisan Kode Backend

## 1. Informasi Dokumen

- **Proyek:** E-Catalogue Backend
- **Runtime:** Node.js
- **Framework:** Express.js 5
- **Database:** MySQL
- **ORM:** Prisma
- **Module system:** ECMAScript Modules (ESM)
- **Bahasa kode:** JavaScript
- **Status:** Pedoman aktif — fondasi dan modul access control telah diimplementasikan

## 2. Tujuan

Dokumen ini menjadi acuan utama untuk:

1. Menentukan struktur folder dan file backend.
2. Menyamakan tanggung jawab setiap layer.
3. Menetapkan cara penamaan dan penulisan kode.
4. Menyeragamkan format request, response, dan error API.
5. Memudahkan penambahan modul tanpa membuat ketergantungan antarmodul yang tidak terkontrol.
6. Memudahkan proses review, testing, debugging, dan pemeliharaan kode.

## 3. Ruang Lingkup

Pedoman ini berlaku untuk seluruh modul backend, termasuk:

- Authentication dan session.
- User, role, permission, dan menu.
- Dashboard.
- Cash flow.
- Customer dan lead.
- Test drive.
- Operational.
- Transaction.
- Unit inventory dan reconditioning.
- Reports.
- Master data.
- Profile.

## 4. Prinsip Arsitektur

Backend menggunakan arsitektur modular berlapis dengan alur:

```text
HTTP Request
    ↓
Route
    ↓
Middleware
    ↓
Validation
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
Prisma / Database
```

Aturan ketergantungan:

- `route` hanya mengatur endpoint dan middleware.
- `controller` hanya menangani HTTP request dan response.
- `service` berisi aturan bisnis dan orkestrasi proses.
- `repository` menjadi satu-satunya layer modul yang mengakses Prisma.
- `validation` mendefinisikan aturan validasi input.
- `middleware` menangani kebutuhan lintas modul.
- Layer bawah tidak boleh mengimpor layer di atasnya.

## 5. Struktur Folder Target

```text
ecatalogue-be/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── config/
│   │   ├── env.js
│   │   └── prisma.js
│   ├── constants/
│   │   ├── error-code.js
│   │   ├── permission.js
│   │   └── role.js
│   ├── middleware/
│   │   ├── access.middleware.js
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── not-found.middleware.js
│   │   └── validation.middleware.js
│   ├── modules/
│   │   ├── menu/
│   │   │   ├── menu.controller.js
│   │   │   ├── menu.repository.js
│   │   │   ├── menu.route.js
│   │   │   ├── menu.service.js
│   │   │   └── menu.validation.js
│   │   ├── role/
│   │   │   ├── role.controller.js
│   │   │   ├── role.repository.js
│   │   │   ├── role.route.js
│   │   │   ├── role.service.js
│   │   │   └── role.validation.js
│   │   ├── user/
│   │   │   ├── user.controller.js
│   │   │   ├── user.repository.js
│   │   │   ├── user.route.js
│   │   │   ├── user.service.js
│   │   │   └── user.validation.js
│   ├── utils/
│   │   ├── app-error.js
│   │   ├── async-handler.js
│   │   ├── pagination.js
│   │   ├── password.js
│   │   └── response.js
│   ├── app.js
│   ├── index.js
│   └── routes.js
├── tests/
│   ├── integration/
│   └── unit/
├── .env.example
├── .gitignore
├── package.json
├── prisma.config.ts
├── prd.md
└── README.md
```

### 5.1 Penyesuaian Struktur yang Telah Dilakukan

Folder lama `src/handler/auth` yang masih kosong telah dihapus. Seluruh fitur baru wajib dibuat di `src/modules`.

File lama berikut telah dihapus karena kosong dan tidak konsisten:

```text
src/handler/auth/auth.controller..js
src/handler/auth/auth.repository
```

Semua file JavaScript wajib menggunakan ekstensi `.js`.

## 6. Tanggung Jawab File Utama

### `src/index.js`

- Menjalankan HTTP server.
- Membaca port dari environment.
- Menangani proses shutdown.
- Tidak berisi konfigurasi route atau aturan bisnis.

### `src/app.js`

- Membuat instance Express.
- Memasang middleware global.
- Memasang root router.
- Memasang not-found dan error middleware.
- Dapat diimpor oleh integration test tanpa menjalankan server.

### `src/routes.js`

- Menggabungkan route dari seluruh modul.
- Menentukan prefix API dan versi endpoint.

Contoh:

```js
import { Router } from "express";
import authRoute from "./modules/auth/auth.route.js";
import userRoute from "./modules/user/user.route.js";

const router = Router();

router.use("/auth", authRoute);
router.use("/users", userRoute);

export default router;
```

### `src/config/prisma.js`

- Membuat dan mengekspor satu instance Prisma Client.
- Mencegah pembuatan koneksi Prisma berulang pada setiap repository.

### `prisma/schema.prisma`

- Menjadi sumber utama struktur database.
- Nama model menggunakan PascalCase.
- Nama field menggunakan camelCase.
- Nama tabel database menggunakan snake_case melalui `@@map`.
- Relasi, index, unique constraint, dan aturan penghapusan harus ditulis eksplisit.

## 7. Standar Modul

Setiap modul menggunakan pola berikut:

```text
<module>.route.js
<module>.controller.js
<module>.service.js
<module>.repository.js
<module>.validation.js
```

### 7.1 Route

Route bertanggung jawab untuk:

- Menentukan HTTP method dan URL.
- Menyusun middleware dalam urutan yang benar.
- Menghubungkan endpoint dengan controller.

Route dilarang:

- Mengakses Prisma.
- Menulis aturan bisnis.
- Membentuk response bisnis.

Contoh:

```js
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import * as authController from "./auth.controller.js";
import { loginSchema } from "./auth.validation.js";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authenticate, authController.logout);

export default router;
```

### 7.2 Controller

Controller bertanggung jawab untuk:

- Mengambil input dari `req.params`, `req.query`, dan `req.body`.
- Memanggil service.
- Menentukan HTTP status.
- Mengirim format response standar.

Controller dilarang:

- Mengakses Prisma.
- Menulis query database.
- Menyimpan aturan bisnis.
- Menangani error dengan `try/catch` berulang jika sudah memakai `asyncHandler`.

Contoh:

```js
import * as authService from "./auth.service.js";
import { sendSuccess } from "../../utils/response.js";

export async function login(req, res) {
  const result = await authService.login(req.body, {
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Login berhasil",
    data: result,
  });
}
```

### 7.3 Service

Service bertanggung jawab untuk:

- Menjalankan aturan bisnis.
- Memeriksa kondisi dan hak akses bisnis.
- Mengorkestrasi satu atau beberapa repository.
- Mengelola transaction database jika proses terdiri dari beberapa perubahan data.
- Melempar error terstandar.

Service dilarang:

- Menggunakan object `req` atau `res`.
- Menentukan bentuk response HTTP.
- Menjalankan query Prisma langsung.

Contoh:

```js
import * as authRepository from "./auth.repository.js";
import { AppError } from "../../utils/app-error.js";

export async function login(payload, metadata) {
  const user = await authRepository.findUserByUsername(payload.username);

  if (!user || !user.isActive) {
    throw new AppError("Username atau password salah", 401, "INVALID_CREDENTIALS");
  }

  // Verifikasi password dan pembuatan session dilakukan di sini.
  return { user, metadata };
}
```

### 7.4 Repository

Repository bertanggung jawab untuk:

- Menjalankan query Prisma.
- Menentukan `select`, `include`, filter, sorting, dan pagination.
- Mengembalikan data mentah yang diperlukan service.

Repository dilarang:

- Menggunakan object `req` atau `res`.
- Menentukan HTTP status.
- Membentuk response API.
- Menyimpan aturan bisnis.

Contoh:

```js
import { prisma } from "../../config/prisma.js";

export function findUserByUsername(username) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      role: true,
    },
  });
}
```

### 7.5 Validation

Validation bertanggung jawab untuk:

- Memvalidasi body, params, dan query sebelum masuk ke controller.
- Melakukan normalisasi sederhana seperti trim dan perubahan format.
- Menghasilkan pesan error yang mudah dipahami.

Aturan bisnis yang membutuhkan data database tetap dilakukan di service, bukan validation.

## 8. Konvensi Penamaan

| Elemen | Format | Contoh |
|---|---|---|
| Folder modul | kebab-case tunggal | `cash-flow`, `sales-order` |
| File | kebab-case + layer | `sales-order.service.js` |
| Variable | camelCase | `currentUser` |
| Function | camelCase, kata kerja | `findUserById` |
| Boolean | prefix `is`, `has`, `can` | `isActive`, `hasAccess` |
| Constant | UPPER_SNAKE_CASE | `DEFAULT_PAGE_SIZE` |
| Class | PascalCase | `AppError` |
| Prisma model | PascalCase tunggal | `RolePermission` |
| Database table | snake_case jamak | `role_permissions` |
| REST resource | kebab-case jamak | `/sales-orders` |
| Permission code | UPPER_SNAKE_CASE | `USER_CREATE` |

Ketentuan tambahan:

- Gunakan nama lengkap dan jelas.
- Hindari singkatan seperti `usr`, `repoData`, `tmp`, atau `val`.
- Function yang mengambil banyak data menggunakan prefix `findMany` atau nama plural.
- Function yang mengambil satu data menggunakan prefix `find`, `get`, atau `findUnique`.
- Function perubahan data menggunakan `create`, `update`, `delete`, `restore`, atau kata kerja domain yang jelas.

## 9. Standar Penulisan JavaScript

### 9.1 Import dan Export

- Gunakan sintaks ESM `import` dan `export`.
- Import file lokal wajib menyertakan ekstensi `.js`.
- Urutan import: package eksternal, internal config/util, lalu file modul.
- Gunakan named export untuk function.
- Gunakan default export hanya untuk object utama seperti Express router.

```js
import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";

import * as userController from "./user.controller.js";
```

### 9.2 Function

- Gunakan `function` declaration untuk function utama yang diekspor.
- Gunakan arrow function untuk callback pendek.
- Satu function harus memiliki satu tanggung jawab utama.
- Hindari function panjang; pecah jika sudah mencampur validasi, query, transformasi, dan response.
- Gunakan `async` hanya jika terdapat operasi asynchronous.

### 9.3 Variable

- Gunakan `const` secara default.
- Gunakan `let` hanya jika nilainya harus diubah.
- Jangan gunakan `var`.
- Hindari mutasi object input.
- Gunakan destructuring jika membuat kode lebih jelas.

### 9.4 Equality dan Nilai Kosong

- Gunakan `===` dan `!==`.
- Gunakan nullish coalescing (`??`) ketika nilai `0`, `false`, atau string kosong tetap valid.
- Jangan memakai pengecekan truthy jika domain membutuhkan perbedaan antara `null`, `undefined`, `0`, dan `false`.

### 9.5 Komentar

- Komentar menjelaskan alasan, batasan, atau keputusan bisnis.
- Jangan menulis komentar yang hanya mengulang isi kode.
- Gunakan JSDoc hanya untuk kontrak function yang kompleks atau reusable.
- TODO harus memiliki konteks yang jelas.

```js
// Session lama tetap disimpan untuk kebutuhan audit, sehingga token hanya direvoke.
await sessionRepository.revokeById(sessionId);
```

## 10. Standar REST API

Base URL:

```text
/api/v1
```

Konvensi endpoint:

| Aksi | Method | Endpoint |
|---|---|---|
| Daftar data | GET | `/users` |
| Detail data | GET | `/users/:id` |
| Membuat data | POST | `/users` |
| Memperbarui data | PATCH | `/users/:id` |
| Menghapus data | DELETE | `/users/:id` |
| Aksi domain | POST | `/sessions/:id/revoke` |

Aturan:

- URL menggunakan kata benda, bukan kata kerja umum.
- Gunakan resource plural.
- Gunakan `PATCH` untuk update parsial.
- Filter, search, sorting, dan pagination dikirim melalui query parameter.
- Endpoint aksi khusus diperbolehkan jika merepresentasikan proses bisnis.

Contoh:

```text
GET /api/v1/users?page=1&limit=20&search=andi&sort=-createdAt
```

## 11. Format Response

### 11.1 Response Berhasil

```json
{
  "success": true,
  "message": "Data user berhasil diambil",
  "data": {
    "id": "uuid",
    "name": "Andi"
  }
}
```

### 11.2 Response List dengan Pagination

```json
{
  "success": true,
  "message": "Daftar user berhasil diambil",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

### 11.3 Response Error

```json
{
  "success": false,
  "message": "Data user tidak ditemukan",
  "error": {
    "code": "USER_NOT_FOUND",
    "details": null
  }
}
```

Error production tidak boleh mengirim:

- Stack trace.
- Query database.
- Password atau hash.
- Token.
- Environment variable.
- Detail internal yang tidak dibutuhkan client.

## 12. HTTP Status Code

| Status | Penggunaan |
|---|---|
| `200` | Request berhasil |
| `201` | Data berhasil dibuat |
| `204` | Berhasil tanpa response body |
| `400` | Format request tidak valid |
| `401` | Belum terautentikasi atau token tidak valid |
| `403` | Tidak memiliki hak akses |
| `404` | Resource tidak ditemukan |
| `409` | Konflik data atau unique constraint |
| `422` | Validasi semantik gagal |
| `500` | Kesalahan internal server |

## 13. Error Handling

Semua error operasional dilempar menggunakan class error terstandar:

```js
throw new AppError("User tidak ditemukan", 404, "USER_NOT_FOUND");
```

Error diproses oleh satu global error middleware.

Prinsip:

- Controller dan service tidak mengirim response error secara manual.
- Error Prisma diterjemahkan menjadi error aplikasi yang aman.
- Pesan untuk client menggunakan Bahasa Indonesia yang jelas.
- Error code bersifat stabil agar dapat dipakai frontend.
- Log internal dapat menyimpan detail teknis, tetapi tidak dikirim ke client.

## 14. Authentication dan Authorization

### Authentication

- Access token dibaca oleh `auth.middleware.js`.
- User terautentikasi ditempatkan pada `req.user`.
- Password hanya disimpan sebagai hash.
- Refresh token yang disimpan di database harus berupa hash.
- Token yang sudah direvoke tidak dapat digunakan kembali.
- User tidak aktif tidak boleh memperoleh session baru.

### Authorization

- Pemeriksaan permission dilakukan setelah authentication.
- Permission menggunakan code yang stabil, misalnya `USER_READ`.
- Role tidak diperiksa secara hard-code jika kebutuhan sebenarnya adalah permission.
- `access.middleware.js` menerima permission yang dibutuhkan endpoint.

Contoh:

```js
router.get(
  "/",
  authenticate,
  authorize("USER_READ"),
  userController.findMany,
);
```

## 15. Aturan Prisma dan Database

- Semua perubahan schema dibuat melalui Prisma migration.
- File migration yang sudah dipakai bersama tidak boleh diedit.
- Jangan menggunakan `db push` sebagai pengganti migration pada environment bersama.
- Setiap relasi wajib memiliki kebijakan `onDelete` dan `onUpdate` yang disengaja.
- Tambahkan index pada foreign key dan field yang sering dipakai untuk filter.
- Tambahkan unique constraint berdasarkan aturan bisnis.
- Gunakan transaction untuk proses yang harus berhasil atau gagal sebagai satu kesatuan.
- Gunakan `select` untuk membatasi field sensitif.
- `passwordHash` dan `refreshTokenHash` tidak boleh dikembalikan ke controller kecuali memang diperlukan service.
- Soft delete menggunakan `deletedAt`; query data aktif harus konsisten memfilter `deletedAt: null`.
- Nilai uang tidak boleh menggunakan floating point. Gunakan tipe database yang presisi dan sepakati format serialisasinya.

## 16. Environment Variable

Environment variable minimal:

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=mysql://user:password@localhost:3306/ecatalogue
ACCESS_TOKEN_SECRET=random-secret-minimal-32-karakter
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN_DAYS=30
ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password-admin
```

Aturan:

- `.env` tidak boleh masuk Git.
- `.env.example` wajib tersedia tanpa secret.
- Aplikasi harus gagal saat startup jika environment variable wajib tidak tersedia.
- Akses environment runtime dipusatkan melalui `src/config/env.js`; script seed membaca environment bootstrap admin secara langsung.

## 17. Logging

Log minimal harus mencatat:

- Timestamp.
- Level log.
- HTTP method dan path.
- Status code.
- Durasi request.
- Request ID.
- Error code untuk request gagal.

Log dilarang memuat:

- Password.
- Access token.
- Refresh token.
- Cookie sensitif.
- Authorization header.
- Data pribadi yang tidak diperlukan.

## 18. Testing

Jenis test:

- **Unit test:** service, utility, dan aturan bisnis.
- **Integration test:** route, middleware, database, dan format response.

Minimum test untuk setiap endpoint:

1. Skenario berhasil.
2. Input tidak valid.
3. Resource tidak ditemukan.
4. User belum login.
5. User tidak memiliki permission.
6. Konflik data jika terdapat unique constraint.

Service diuji dengan repository yang di-mock. Integration test menggunakan database khusus test.

## 19. Aturan Keamanan

- Validasi semua input dari client.
- Jangan percaya `roleId`, `userId`, harga, atau status yang dikirim client tanpa pemeriksaan bisnis.
- Terapkan limit ukuran request body.
- Gunakan CORS allowlist pada production.
- Terapkan rate limit pada login dan endpoint sensitif.
- Gunakan hash password yang aman.
- Jangan menyimpan token mentah pada database.
- Hindari mass assignment; tulis field yang boleh dibuat atau diperbarui secara eksplisit.
- Jangan mengirim field sensitif melalui response.
- Semua query custom harus menggunakan parameter binding.

## 20. Definition of Done

Sebuah endpoint dianggap selesai jika:

- Struktur file mengikuti standar modul.
- Route memiliki authentication dan authorization yang sesuai.
- Input telah divalidasi.
- Controller tidak mengandung query atau aturan bisnis.
- Service memiliki aturan bisnis yang jelas.
- Repository membatasi field yang diambil.
- Response dan error mengikuti format standar.
- Tidak ada secret atau data sensitif di log dan response.
- Migration dan seed tersedia jika ada perubahan database.
- Skenario utama dan error memiliki test.
- Dokumentasi endpoint diperbarui.
- Lint dan test berhasil dijalankan.

## 21. Checklist Code Review

- Apakah nama file, variable, dan function sudah konsisten?
- Apakah tanggung jawab route, controller, service, dan repository terpisah?
- Apakah ada akses Prisma di luar repository?
- Apakah validasi input sudah mencakup body, params, dan query?
- Apakah authorization dilakukan berdasarkan permission?
- Apakah query berpotensi mengirim hash, token, atau data sensitif?
- Apakah error menggunakan status dan code yang tepat?
- Apakah proses multi-query membutuhkan transaction?
- Apakah pagination dan index database diperlukan?
- Apakah kode baru memiliki test?
- Apakah perubahan schema memiliki migration?
- Apakah `.env.example` dan dokumentasi perlu diperbarui?

## 22. Keputusan Awal Proyek

1. Folder fitur standar adalah `src/modules`, bukan `src/handler`.
2. Setiap modul memakai lima layer utama: route, controller, service, repository, dan validation.
3. Prisma hanya diakses dari repository atau callback transaction yang dikelola secara eksplisit.
4. API menggunakan prefix `/api/v1`.
5. Format response dan error harus konsisten pada seluruh endpoint.
6. Hak akses endpoint menggunakan permission code.
7. Semua file JavaScript menggunakan ESM dan ekstensi `.js`.
8. Validasi awal menggunakan validator internal, hashing password menggunakan `node:crypto` dengan `scrypt`, dan koneksi Prisma menggunakan `@prisma/adapter-mariadb`.

## 23. Implementasi Access Control

### 23.1 Relasi Domain

```text
User ── memiliki satu ──> Role
Role ── memiliki banyak ──> RolePermission
RolePermission ── mengarah ke ──> Permission
Menu ── memiliki banyak ──> Permission
```

Keputusan implementasi:

- Permission tidak ditempel langsung ke user.
- User memperoleh permission melalui role.
- Satu user hanya memiliki satu role aktif pada satu waktu.
- Satu permission hanya dimiliki oleh satu menu.
- Satu role dapat memiliki banyak permission dari berbagai menu.
- Penggantian permission role dilakukan secara penuh dan atomik.

### 23.2 Modul Role

Base endpoint:

```text
/api/v1/roles
```

| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/roles` | Daftar role dengan pagination dan search |
| `GET` | `/roles/:id` | Detail role beserta permission |
| `POST` | `/roles` | Membuat role |
| `PATCH` | `/roles/:id` | Memperbarui role |
| `DELETE` | `/roles/:id` | Menghapus role jika tidak digunakan user |
| `PUT` | `/roles/:id/permissions` | Mengganti seluruh permission milik role |

Request assignment permission:

```json
{
  "permissionIds": [
    "permission-uuid-1",
    "permission-uuid-2"
  ]
}
```

Aturan bisnis:

- `code` role disimpan dalam uppercase.
- `code` role harus unik.
- Role yang masih direferensikan user, termasuk user soft-deleted, tidak dapat dihapus karena foreign key menggunakan `onDelete: Restrict`.
- Semua `permissionIds` harus tersedia.
- Array kosong diperbolehkan untuk mencabut seluruh permission role.
- Duplikat ID dan string kosong ditolak.
- Penghapusan dan pembuatan ulang `RolePermission` dijalankan dalam transaction.

### 23.3 Modul Group Menu, Menu, dan Permission

Hierarki:

```text
Group Menu → Menu → Permission
```

| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/menus/groups` | Daftar group beserta menu dan permission |
| `GET` | `/menus/groups/:groupId` | Detail group beserta menu dan permission |
| `POST` | `/menus/groups` | Membuat group menu |
| `PATCH` | `/menus/groups/:groupId` | Memperbarui group menu |
| `DELETE` | `/menus/groups/:groupId` | Menghapus group kosong |
| `POST` | `/menus/groups/:groupId/items` | Membuat menu di dalam group |
| `GET` | `/menus/:id` | Detail menu beserta permission |
| `PATCH` | `/menus/:id` | Memperbarui menu |
| `DELETE` | `/menus/:id` | Menghapus menu dan relasi turunannya |
| `POST` | `/menus/:menuId/permissions` | Membuat permission pada menu |
| `PATCH` | `/menus/:menuId/permissions/:permissionId` | Memperbarui permission |
| `DELETE` | `/menus/:menuId/permissions/:permissionId` | Menghapus permission |

Contoh request group menu:

```json
{
  "name": "Master Data",
  "code": "MASTER_DATA",
  "description": "Pengelolaan data utama",
  "icon": "database",
  "sortOrder": 10,
  "isActive": true
}
```

Contoh request menu:

```json
{
  "name": "User",
  "code": "USER",
  "description": "Manajemen user",
  "path": "/access-control/users",
  "icon": "users",
  "sortOrder": 30,
  "isActive": true
}
```

Contoh request permission:

```json
{
  "name": "Lihat User",
  "code": "USER_READ",
  "description": "Melihat daftar dan detail user"
}
```

Aturan bisnis:

- Setiap menu wajib memiliki satu group menu.
- Menu hanya dibuat melalui endpoint nested group dan tidak dapat dipindahkan.
- Group yang masih memiliki menu tidak dapat dihapus.
- `code` menu dan permission disimpan dalam uppercase.
- `code` harus unik secara global pada tabel masing-masing.
- Permission hanya dapat diubah atau dihapus melalui menu pemiliknya.
- Penghapusan menu menghapus permission dan `RolePermission` terkait melalui cascade database.
- Dampak cascade wajib ditampilkan pada UI sebelum user mengonfirmasi penghapusan menu.

### 23.4 Modul User dan Assignment Role

Base endpoint:

```text
/api/v1/users
```

| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/users` | Daftar user aktif/non-deleted |
| `GET` | `/users/:id` | Detail user dan role |
| `POST` | `/users` | Membuat user dengan role |
| `PATCH` | `/users/:id` | Memperbarui profil, status, atau password |
| `PUT` | `/users/:id/role` | Mengganti role user |
| `DELETE` | `/users/:id` | Soft delete user dan revoke session |

Contoh request membuat user:

```json
{
  "name": "Admin E-Catalogue",
  "email": "admin@example.com",
  "username": "admin",
  "password": "password-kuat",
  "roleId": "role-uuid",
  "isActive": true
}
```

Request assignment role:

```json
{
  "roleId": "role-uuid"
}
```

Aturan bisnis:

- Email dinormalisasi menjadi lowercase.
- Username dinormalisasi menjadi lowercase.
- Password minimal delapan karakter.
- Password disimpan sebagai hash `scrypt` dengan salt acak.
- `passwordHash` tidak pernah dipilih pada response repository.
- User hanya dapat diberi role yang tersedia dan aktif.
- Penghapusan user menggunakan `deletedAt`, mengubah `isActive` menjadi `false`, dan merevoke session aktif dalam transaction.
- Perubahan role menggunakan endpoint khusus agar mudah diaudit.

### 23.5 Query Parameter

Endpoint list mendukung:

```text
page=1
limit=20
search=keyword
```

Endpoint user juga mendukung:

```text
roleId=<uuid>
isActive=true|false
```

Nilai maksimum `limit` adalah `100`.

### 23.6 Permission Code Awal

Seed menyediakan permission:

| Menu | Permission |
|---|---|
| Role | `ROLE_READ`, `ROLE_CREATE`, `ROLE_UPDATE`, `ROLE_DELETE`, `ROLE_SET_PERMISSION` |
| Menu | `MENU_READ`, `MENU_CREATE`, `MENU_UPDATE`, `MENU_DELETE`, `PERMISSION_MANAGE` |
| User | `USER_READ`, `USER_CREATE`, `USER_UPDATE`, `USER_DELETE`, `USER_SET_ROLE` |

Role `ADMIN` memperoleh seluruh permission tersebut saat seed dijalankan.

### 23.7 Status Authentication

Authentication dan authorization telah diimplementasikan. Seluruh endpoint role, menu, permission, dan user wajib menggunakan Bearer access token serta permission code yang sesuai.

## 24. Setup dan Perintah

```bash
npm install
npm run generate
npm run migrate
npm run seed
npm run dev
```

Environment minimal tersedia pada `.env.example`.

Prisma menggunakan:

```text
@prisma/client
@prisma/adapter-mariadb
```

Generator Prisma menggunakan `prisma-client-js` agar hasil generate kompatibel dengan runtime JavaScript ESM proyek ini.

## 25. Modul Authentication

### 25.1 Strategi Token dan Session

- Access token menggunakan JWT HS256.
- Claim access token terdiri dari `sub` sebagai user ID, `sid` sebagai session ID, `iat`, dan `exp`.
- Masa berlaku default access token adalah 15 menit.
- Refresh token berupa 48 byte random token dalam format base64url.
- Database hanya menyimpan hash SHA-256 refresh token.
- Satu user dapat memiliki beberapa session untuk perangkat berbeda.
- Refresh token dirotasi pada setiap refresh.
- Rotasi tidak memperpanjang batas absolut session, default 30 hari sejak login.
- Middleware mengambil user, role, permission, menu, dan status session terbaru dari database pada setiap request.

### 25.2 Endpoint

Base endpoint:

```text
/api/v1/auth
```

| Method | Endpoint | Authentication | Fungsi |
|---|---|---|---|
| `POST` | `/auth/login` | Tidak | Login dengan username atau email |
| `POST` | `/auth/refresh` | Tidak | Rotasi refresh token dan access token |
| `GET` | `/auth/me` | Bearer | Mengambil profil dan akses terbaru |
| `POST` | `/auth/logout` | Bearer | Mencabut session aktif |
| `POST` | `/auth/logout-all` | Bearer | Mencabut seluruh session user |

Request login:

```json
{
  "identifier": "admin",
  "password": "password-admin"
}
```

Request refresh:

```json
{
  "refreshToken": "refresh-token"
}
```

Response login dan refresh:

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "accessToken": "jwt",
    "refreshToken": "random-token",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "refreshExpiresAt": "2026-07-24T00:00:00.000Z",
    "user": {},
    "permissionCodes": [],
    "groupMenus": []
  }
}
```

### 25.3 Error Authentication

| Code | Kondisi |
|---|---|
| `INVALID_CREDENTIALS` | Identifier atau password salah |
| `INVALID_ACCESS_TOKEN` | Bearer token hilang, rusak, atau kedaluwarsa |
| `INVALID_REFRESH_TOKEN` | Refresh token tidak ditemukan atau sudah dirotasi |
| `SESSION_REVOKED` | Session sudah logout atau dicabut |
| `SESSION_EXPIRED` | Batas absolut refresh session terlewati |
| `USER_INACTIVE` | User nonaktif atau soft-deleted |
| `ROLE_INACTIVE` | Role user tidak aktif |
| `FORBIDDEN` | User tidak memiliki permission endpoint |

### 25.4 Environment

```dotenv
ACCESS_TOKEN_SECRET="random-secret-minimal-32-karakter"
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN_DAYS=30

ADMIN_NAME="Administrator"
ADMIN_EMAIL="admin@example.com"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="password-admin"
```

Seed meng-upsert user administrator dari environment dan memberikan role `ADMIN`. Seed harus gagal jika salah satu environment bootstrap admin tidak tersedia.

### 25.5 Permission Endpoint

| Resource | Permission |
|---|---|
| List/detail role | `ROLE_READ` |
| Create role | `ROLE_CREATE` |
| Update role | `ROLE_UPDATE` |
| Delete role | `ROLE_DELETE` |
| Assignment permission role | `ROLE_SET_PERMISSION` |
| List/detail menu | `MENU_READ` |
| List/detail group menu | `MENU_READ` |
| Create group/menu | `MENU_CREATE` |
| Update menu | `MENU_UPDATE` |
| Update group menu | `MENU_UPDATE` |
| Delete group/menu | `MENU_DELETE` |
| Create/update/delete permission | `PERMISSION_MANAGE` |
| List/detail user | `USER_READ` |
| Create user | `USER_CREATE` |
| Update user | `USER_UPDATE` |
| Delete user | `USER_DELETE` |
| Assignment role user | `USER_SET_ROLE` |

## 26. Group Menu

### 26.1 Model

`GroupMenu` menyimpan `name`, `code`, `description`, `icon`, `sortOrder`, dan `isActive`. Relasi `Menu.groupMenuId` wajib dan menggunakan `onDelete: Restrict`.

### 26.2 Migration

Migration membuat group awal `MASTER_DATA`, menghubungkan seluruh menu lama ke group tersebut, lalu mengubah `groupMenuId` menjadi wajib. Strategi ini mempertahankan data menu, permission, dan role-permission yang sudah ada.

### 26.3 Navigasi Authentication

Login, refresh, dan `/auth/me` mengembalikan `groupMenus`, bukan `menus`. Hanya group aktif, menu aktif, dan permission milik role yang disertakan. Group dan menu diurutkan menggunakan `sortOrder`.

### 26.4 Seed

Seed meng-upsert group `MASTER_DATA`, lalu menempatkan menu `ROLE`, `MENU`, dan `USER` di dalamnya. Seed tetap memberikan seluruh permission kepada role `ADMIN` dan aman dijalankan berulang.

Panduan integrasi frontend dan penggunaan refresh token tersedia pada `docs/frontend-integration.md`.

## 27. Modul Branch

### 27.1 Fungsi

Modul branch digunakan untuk mengelola master data cabang (branch) dari dealer atau perusahaan.

### 27.2 Endpoint

Base endpoint:

```text
/api/v1/branches
```

| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/branches` | Ambil daftar branch |
| `GET` | `/branches/:id` | Ambil detail branch |
| `POST` | `/branches` | Buat branch baru |
| `PATCH` | `/branches/:id` | Ubah branch |
| `DELETE` | `/branches/:id` | Nonaktifkan branch (soft delete) |

### 27.3 Cara Penggunaan

- Semua endpoint branch wajib login.
- Akses dibatasi dengan permission:
  - `BRANCH_READ`
  - `BRANCH_CREATE`
  - `BRANCH_UPDATE`
  - `BRANCH_DELETE`
- Endpoint list mendukung query parameter standar:
  - `page`
  - `limit`
  - `search`
  - `isActive`

### 27.4 Request

#### Create Branch

```json
{
  "name": "Cabang Jakarta Pusat",
  "code": "JKT-01",
  "address": "Jl. Jend. Sudirman No. 1",
  "phone": "021-1234567",
  "isActive": true
}
```

#### Update Branch

```json
{
  "name": "Cabang Jakarta Pusat Baru",
  "phone": "021-7654321",
  "isActive": false
}
```

Aturan input:

- `name` wajib untuk create, opsional untuk update.
- `code` wajib untuk create, harus unik, disarankan format uppercase tanpa spasi, opsional untuk update.
- `address` opsional.
- `phone` opsional.
- `isActive` opsional (default: true).

### 27.5 Return

#### List Branch

```json
{
  "success": true,
  "message": "Daftar branch berhasil diambil",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

#### Detail / Create / Update / Delete

```json
{
  "success": true,
  "message": "Branch berhasil diperbarui",
  "data": {
    "id": "uuid",
    "name": "Cabang Jakarta Pusat",
    "code": "JKT-01",
    "address": "Jl. Jend. Sudirman No. 1",
    "phone": "021-1234567",
    "isActive": true,
    "createdAt": "2026-06-25T14:00:00.000Z",
    "updatedAt": "2026-06-25T14:00:00.000Z"
  }
}
```
