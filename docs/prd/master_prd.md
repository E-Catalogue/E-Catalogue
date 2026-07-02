# PRD API Module Access Control

## 1. Informasi Umum

- Proyek: E-Catalogue Backend
- Base path API: `/api/v1`
- Format request: JSON
- Format response sukses: `{ success, message, data, meta? }`
- Format response error: `{ success: false, message, error: { code, details } }`
- Autentikasi: `Authorization: Bearer <accessToken>`

Dokumen ini menjelaskan fungsi, cara pakai, dan bentuk request/response untuk module:

- `src/modules/role/`
- `src/modules/user/`
- `src/modules/menu/`
- `src/modules/auth/`

## 2. Standar Response

### 2.1 Success

```json
{
  "success": true,
  "message": "Pesan berhasil",
  "data": {},
  "meta": {}
}
```

Keterangan:

- `data` berisi payload utama dari endpoint.
- `meta` hanya muncul pada endpoint list/pagination.

### 2.2 Error

```json
{
  "success": false,
  "message": "Pesan error",
  "error": {
    "code": "ERROR_CODE",
    "details": null
  }
}
```

Contoh status error yang umum:

- `401` untuk token tidak valid, login gagal, session expired/revoked.
- `403` untuk permission tidak cukup.
- `404` untuk data tidak ditemukan.
- `409` untuk konflik data.
- `422` untuk validasi request gagal.

## 3. Module Role

### 3.1 Fungsi

Module role digunakan untuk mengelola master role dan permission yang melekat pada role.

### 3.2 Endpoint

| Method | Endpoint | Fungsi | Permission Code |
|---|---|---|---|
| GET | `/api/v1/roles` | Ambil daftar role | `ROLE_READ` |
| GET | `/api/v1/roles/:id` | Ambil detail role | `ROLE_READ` |
| POST | `/api/v1/roles` | Buat role baru | `ROLE_CREATE` |
| PATCH | `/api/v1/roles/:id` | Ubah role | `ROLE_UPDATE` |
| DELETE | `/api/v1/roles/:id` | Hapus role | `ROLE_DELETE` |
| PUT | `/api/v1/roles/:id/permissions` | Ganti permission pada role | `ROLE_SET_PERMISSION` |

### 3.3 Cara Penggunaan

- Semua endpoint role wajib login.
- Aksesnya dibatasi dengan permission:
  - `ROLE_READ`
  - `ROLE_CREATE`
  - `ROLE_UPDATE`
  - `ROLE_DELETE`
  - `ROLE_SET_PERMISSION`
- Endpoint list mendukung query:
  - `page`
  - `limit`
  - `search`

### 3.4 Request

#### Create / Update Role

```json
{
  "name": "Administrator",
  "code": "ADMIN",
  "description": "Role untuk admin",
  "isActive": true
}
```

Aturan input:

- `name` wajib untuk create, opsional untuk update.
- `code` wajib untuk create, opsional untuk update, format uppercase seperti `ADMIN`.
- `description` opsional.
- `isActive` opsional.

#### Set Permissions

```json
{
  "permissionIds": ["permission-id-1", "permission-id-2"]
}
```

### 3.5 Return

#### List Role

```json
{
  "success": true,
  "message": "Daftar role berhasil diambil",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

#### Detail / Create / Update / Delete / Set Permission

```json
{
  "success": true,
  "message": "Role berhasil diperbarui",
  "data": {}
}
```

Catatan:

- Detail role akan menyertakan daftar permission yang dimiliki role.
- Delete role akan gagal jika role masih dipakai user.

## 4. Module User

### 4.1 Fungsi

Module user digunakan untuk mengelola data akun pengguna, termasuk pembuatan akun, perubahan data, pengaturan role, pengaturan branch, dan soft delete.

### 4.2 Endpoint

| Method | Endpoint | Fungsi | Permission Code |
|---|---|---|---|
| GET | `/api/v1/users` | Ambil daftar user | `USER_READ` |
| GET | `/api/v1/users/:id` | Ambil detail user | `USER_READ` |
| POST | `/api/v1/users` | Buat user baru | `USER_CREATE` |
| PATCH | `/api/v1/users/:id` | Ubah user | `USER_UPDATE` |
| PUT | `/api/v1/users/:id/role` | Ubah role user | `USER_SET_ROLE` |
| PUT | `/api/v1/users/:id/branch` | Ubah branch user | `USER_SET_BRANCH` |
| DELETE | `/api/v1/users/:id` | Nonaktifkan user | `USER_DELETE` |

### 4.3 Cara Penggunaan

- Semua endpoint user wajib login.
- Akses dibatasi dengan permission:
  - `USER_READ`
  - `USER_CREATE`
  - `USER_UPDATE`
  - `USER_DELETE`
  - `USER_SET_ROLE`
  - `USER_SET_BRANCH`
- Endpoint list mendukung query:
  - `page`
  - `limit`
  - `search`
  - `roleId`
  - `isActive`

### 4.4 Request

#### Create User

```json
{
  "name": "Budi",
  "email": "budi@mail.com",
  "username": "budi",
  "password": "password123",
  "roleId": "role-id",
  "branchId": "branch-id"
}
```

#### Update User

```json
{
  "name": "Budi Baru",
  "email": "budi.baru@mail.com",
  "username": "budi_baru",
  "password": "password123",
  "isActive": true
}
```

#### Set Role

```json
{
  "roleId": "role-id"
}
```

#### Set Branch

```json
{
  "branchId": "branch-id"
}
```

Aturan input:

- `email` harus valid dan akan dinormalisasi ke lowercase.
- `username` hanya boleh berisi huruf, angka, titik, underscore, dan strip.
- `password` wajib saat create, opsional saat update.
- `roleId` wajib saat create dan saat ubah role.
- `branchId` opsional saat create dan wajib saat ubah branch.

### 4.5 Return

#### List User

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

#### Detail / Create / Update / Set Role / Set Branch / Delete

```json
{
  "success": true,
  "message": "User berhasil diperbarui",
  "data": {}
}
```

Catatan:

- Delete user bukan hard delete. Sistem akan menonaktifkan user dan mencabut session aktif.
- Response user menyertakan informasi role dan branch singkat.

## 5. Module Menu

### 5.1 Fungsi

Module menu digunakan untuk mengelola struktur navigasi aplikasi:

- group menu
- menu
- permission

### 5.2 Endpoint

#### Group Menu

| Method | Endpoint | Fungsi | Permission Code |
|---|---|---|---|
| GET | `/api/v1/menus/groups` | Ambil daftar group menu | `MENU_READ` |
| GET | `/api/v1/menus/groups/:groupId` | Ambil detail group menu | `MENU_READ` |
| POST | `/api/v1/menus/groups` | Buat group menu | `MENU_CREATE` |
| PATCH | `/api/v1/menus/groups/:groupId` | Ubah group menu | `MENU_UPDATE` |
| DELETE | `/api/v1/menus/groups/:groupId` | Hapus group menu | `MENU_DELETE` |
| POST | `/api/v1/menus/groups/:groupId/items` | Buat menu pada group tertentu | `MENU_CREATE` |

#### Menu

| Method | Endpoint | Fungsi | Permission Code |
|---|---|---|---|
| GET | `/api/v1/menus/:id` | Ambil detail menu | `MENU_READ` |
| PATCH | `/api/v1/menus/:id` | Ubah menu | `MENU_UPDATE` |
| DELETE | `/api/v1/menus/:id` | Hapus menu | `MENU_DELETE` |

#### Permission

| Method | Endpoint | Fungsi | Permission Code |
|---|---|---|---|
| POST | `/api/v1/menus/:menuId/permissions` | Buat permission | `PERMISSION_MANAGE` |
| PATCH | `/api/v1/menus/:menuId/permissions/:permissionId` | Ubah permission | `PERMISSION_MANAGE` |
| DELETE | `/api/v1/menus/:menuId/permissions/:permissionId` | Hapus permission | `PERMISSION_MANAGE` |

### 5.3 Cara Penggunaan

- Semua endpoint menu wajib login.
- Akses dibatasi dengan permission:
  - `MENU_READ`
  - `MENU_CREATE`
  - `MENU_UPDATE`
  - `MENU_DELETE`
  - `PERMISSION_MANAGE`
- Endpoint list group menu mendukung query:
  - `page`
  - `limit`
  - `search`

### 5.4 Request

#### Create / Update Group Menu

```json
{
  "name": "Master Data",
  "code": "MASTER_DATA",
  "description": "Menu induk master data",
  "icon": "box",
  "sortOrder": 1,
  "isActive": true
}
```

#### Create Menu

```json
{
  "name": "User",
  "code": "USER",
  "description": "Menu pengelolaan user",
  "path": "/users",
  "icon": "user",
  "sortOrder": 1,
  "isActive": true
}
```

#### Create / Update Permission

```json
{
  "name": "Read User",
  "code": "USER_READ",
  "description": "Hak akses baca user"
}
```

Aturan input:

- `groupMenuId` tidak dikirim di body saat create menu, karena ditentukan dari URL.
- `code` harus uppercase dengan format seperti `USER_READ`.
- `sortOrder` berupa bilangan bulat.
- `isActive` opsional pada group menu dan menu.

### 5.5 Return

#### List Group Menu

```json
{
  "success": true,
  "message": "Daftar group menu berhasil diambil",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

#### Detail / Create / Update / Delete Group Menu, Menu, Permission

```json
{
  "success": true,
  "message": "Menu berhasil diperbarui",
  "data": {}
}
```

Catatan:

- Group menu berisi daftar menu.
- Menu berisi daftar permission.
- Delete group menu akan gagal jika masih punya menu.

## 6. Module Auth

### 6.1 Fungsi

Module auth menangani:

- login
- refresh access token
- ambil profil user login
- logout session aktif
- logout semua session

### 6.2 Endpoint

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/refresh` | Tukar refresh token menjadi access token baru |
| GET | `/api/v1/auth/me` | Ambil profil user login |
| POST | `/api/v1/auth/logout` | Logout session aktif |
| POST | `/api/v1/auth/logout-all` | Logout semua session user |

### 6.3 Cara Penggunaan

Alur normal client:

1. Panggil `/auth/login` dengan `identifier` dan `password`.
2. Simpan `accessToken` dan `refreshToken`.
3. Gunakan `accessToken` pada header `Authorization: Bearer <accessToken>` untuk semua endpoint yang dilindungi.
4. Jika access token expired, panggil `/auth/refresh` dengan `refreshToken`.
5. Ganti token lama dengan token baru dari response refresh.

### 6.4 Request

#### Login

```json
{
  "identifier": "admin",
  "password": "password123"
}
```

Keterangan:

- `identifier` bisa username atau email.
- Sistem akan menormalisasi `identifier` ke lowercase.

#### Refresh

```json
{
  "refreshToken": "refresh-token-string"
}
```

#### Me / Logout / Logout All

- Tidak ada body.
- Wajib menyertakan header:

```http
Authorization: Bearer <accessToken>
```

### 6.5 Return

**Catatan untuk Frontend:**
- `groupMenus`: Gunakan array ini untuk merender navigasi sidebar (menu apa saja yang bisa dilihat user).
- `permissionCodes`: Gunakan array ini untuk menyembunyikan atau menampilkan action secara granular di dalam halaman (misalnya membatasi tombol Create/Update/Delete).

#### Login

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "refresh-token-string",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "refreshExpiresAt": "2026-06-26T00:00:00.000Z",
    "user": {
      "id": "user-id",
      "name": "Admin",
      "email": "admin@mail.com",
      "username": "admin",
      "isActive": true,
      "lastLoginAt": "2026-06-25T12:00:00.000Z",
      "role": {
        "id": "role-id",
        "name": "Administrator",
        "code": "ADMIN"
      }
    },
    "permissionCodes": ["USER_READ", "ROLE_READ"],
    "groupMenus": []
  }
}
```

#### Refresh

```json
{
  "success": true,
  "message": "Token berhasil diperbarui",
  "data": {
    "accessToken": "jwt-access-token-baru",
    "refreshToken": "refresh-token-baru",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "refreshExpiresAt": "2026-06-26T00:00:00.000Z",
    "user": {},
    "permissionCodes": [],
    "groupMenus": []
  }
}
```

#### Me

```json
{
  "success": true,
  "message": "Profil berhasil diambil",
  "data": {
    "user": {},
    "permissionCodes": [],
    "groupMenus": []
  }
}
```

#### Logout

```json
{
  "success": true,
  "message": "Logout berhasil",
  "data": null
}
```

#### Logout All

```json
{
  "success": true,
  "message": "Seluruh session berhasil dicabut",
  "data": {
    "revokedSessions": 3
  }
}
```

## 7. Refresh Token Detail

Bagian ini adalah inti dari module auth.

### 7.1 Prinsip Kerja

Refresh token dipakai untuk membuat access token baru tanpa login ulang.

Implementasi yang berjalan:

- Saat login, sistem membuat:
  - `accessToken` berupa JWT
  - `refreshToken` acak
- Refresh token tidak disimpan dalam bentuk asli di database.
- Yang disimpan adalah hash SHA-256 dari refresh token.
- Satu session hanya punya satu refresh token aktif.
- Setiap refresh akan melakukan rotation, artinya refresh token lama diganti token baru.

### 7.2 Detail Penyimpanan

Saat login:

1. Sistem membuat refresh token acak dengan `randomBytes(48)` dan encoding `base64url`.
2. Refresh token di-hash menggunakan SHA-256.
3. Hash disimpan ke tabel `session.refreshTokenHash`.
4. Session juga menyimpan:
   - `userId`
   - `expiresAt`
   - `ipAddress`
   - `userAgent`

### 7.3 Detail Access Token

Access token:

- berbentuk JWT
- berisi:
  - `sub` = userId
  - `sid` = sessionId
- berlaku sesuai konfigurasi `ACCESS_TOKEN_EXPIRES_IN`

Setiap request protected akan:

1. membaca header `Authorization`
2. memverifikasi JWT
3. mencari session aktif berdasarkan `userId` dan `sessionId`
4. menolak request jika session dicabut, expired, atau user/role tidak aktif

### 7.4 Flow Refresh Token

Urutan proses refresh:

1. Client mengirim `refreshToken` ke `/auth/refresh`.
2. Server meng-hash refresh token tersebut.
3. Server mencari session berdasarkan hash.
4. Jika session tidak ditemukan, response:

```json
{
  "success": false,
  "message": "Refresh token tidak valid",
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "details": null
  }
}
```

5. Jika session sudah dicabut, response:

```json
{
  "success": false,
  "message": "Session telah dicabut",
  "error": {
    "code": "SESSION_REVOKED",
    "details": null
  }
}
```

6. Jika session expired, response:

```json
{
  "success": false,
  "message": "Session telah kedaluwarsa",
  "error": {
    "code": "SESSION_EXPIRED",
    "details": null
  }
}
```

7. Jika valid, server membuat refresh token baru.
8. Hash refresh token lama diganti dengan hash token baru.
9. Server mengembalikan access token baru dan refresh token baru.

### 7.5 Rotation Behavior

Hal penting pada refresh token:

- Refresh token bersifat one-time use per rotation.
- Setelah sukses refresh, refresh token lama tidak boleh dipakai lagi.
- Jika token lama dipakai ulang, server akan menolak dengan `INVALID_REFRESH_TOKEN`.
- Mekanisme ini mengurangi risiko replay attack.

### 7.6 Logout dan Pencabutan Session

#### Logout

- Endpoint: `POST /api/v1/auth/logout`
- Efek:
  - session aktif dicabut
  - access token yang terikat ke session tersebut menjadi tidak valid pada request berikutnya

#### Logout All

- Endpoint: `POST /api/v1/auth/logout-all`
- Efek:
  - semua session user dicabut
  - cocok untuk reset keamanan setelah password berubah atau saat akun dianggap berisiko

### 7.7 Rekomendasi Pemakaian di Client

- Simpan `accessToken` untuk header request.
- Simpan `refreshToken` secara aman dan terpisah.
- Jangan kirim refresh token di header umum.
- Jika menerima `401` karena access token kedaluwarsa, coba refresh sekali.
- Jika refresh gagal, arahkan user login ulang.

## 8. Ringkasan Singkat Per Module

- Role: mengelola master role dan permission mapping.
- User: mengelola akun user dan assignment role.
- Menu: mengelola group menu, menu, dan permission.
- Auth: menangani login, refresh token, profile, logout, dan session control.

### 9. Module Merek

### 9.1 Fungsi
Module merek digunakan untuk mengelola master data merek kendaraan atau produk.

### 9.2 Endpoint
| Method | Endpoint | Fungsi | Permission Code |
|---|---|---|---|
| GET | `/api/v1/mereks` | Ambil daftar merek | `MEREK_READ` |
| GET | `/api/v1/mereks/:id` | Ambil detail merek | `MEREK_READ` |
| POST | `/api/v1/mereks` | Buat merek baru | `MEREK_CREATE` |
| PATCH | `/api/v1/mereks/:id` | Ubah merek | `MEREK_UPDATE` |
| DELETE | `/api/v1/mereks/:id` | Hapus merek | `MEREK_DELETE` |

### 9.3 Cara Penggunaan
- Akses dibatasi menggunakan autentikasi (wajib login).
- Endpoint list mendukung query parameters:
  - `page` (nomor halaman, default 1)
  - `limit` (jumlah data per halaman, default 20)
  - `search` (filter pencarian nama merek)
  - `isActive` (filter status aktif/tidak aktif, nilai: `true` / `false`)

### 9.4 Request
#### Create / Update Merek
```json
{
  "name": "Toyota",
  "isActive": true
}
```
Aturan input:
- `name` wajib saat create, minimal 2 karakter.
- `isActive` opsional (boolean).

### 9.5 Return
#### List Merek
```json
{
  "success": true,
  "message": "Daftar merek berhasil diambil",
  "data": [
    {
      "id": "merek-uuid-1",
      "name": "Toyota",
      "isActive": true,
      "createdAt": "2026-06-28T18:00:00.000Z",
      "updatedAt": "2026-06-28T18:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Detail / Create / Update / Delete Merek
```json
{
  "success": true,
  "message": "Merek berhasil diperbarui",
  "data": {
    "id": "merek-uuid-1",
    "name": "Toyota",
    "isActive": true,
    "createdAt": "2026-06-28T18:00:00.000Z",
    "updatedAt": "2026-06-28T18:00:00.000Z"
  }
}
```
Catatan:
- Jika nama merek yang dikirim sudah terdaftar, server mengembalikan error `409` dengan code `MEREK_ALREADY_EXISTS`.
- Penghapusan merek (DELETE) akan gagal dengan error `409` (`MEREK_IN_USE`) jika merek tersebut masih memiliki relasi ke data Tipe.

---

## 10. Module Tipe (Nested in Merek)

### 10.1 Fungsi
Module tipe digunakan untuk mengelola data tipe kendaraan yang merujuk pada merek tertentu.

### 10.2 Endpoint
| Method | Endpoint | Fungsi | Permission Code |
|---|---|---|---|
| GET | `/api/v1/mereks/:merekId/tipes` | Ambil daftar tipe berdasarkan merek | `TIPE_READ` |
| GET | `/api/v1/mereks/:merekId/tipes/:id` | Ambil detail tipe | `TIPE_READ` |
| POST | `/api/v1/mereks/:merekId/tipes` | Buat tipe baru di bawah merek tertentu | `TIPE_CREATE` |
| PATCH | `/api/v1/mereks/:merekId/tipes/:id` | Ubah tipe | `TIPE_UPDATE` |
| DELETE | `/api/v1/mereks/:merekId/tipes/:id` | Hapus tipe | `TIPE_DELETE` |

### 10.3 Cara Penggunaan
- Endpoint tipe membutuhkan parameter `:merekId` pada path URL untuk membatasi tipe sesuai mereknya.
- Akses dibatasi menggunakan autentikasi (wajib login).
- Endpoint list mendukung query parameters:
  - `page` (default 1)
  - `limit` (default 20)
  - `search` (filter pencarian nama tipe)
  - `isActive` (filter status aktif/tidak aktif, nilai: `true` / `false`)

### 10.4 Request
#### Create / Update Tipe
```json
{
  "name": "Avanza",
  "isActive": true
}
```
Aturan input:
- `name` wajib saat create, minimal 2 karakter.
- `isActive` opsional (boolean).

### 10.5 Return
#### List Tipe
```json
{
  "success": true,
  "message": "Daftar tipe berhasil diambil",
  "data": [
    {
      "id": "tipe-uuid-1",
      "name": "Avanza",
      "isActive": true,
      "merekId": "merek-uuid-1",
      "createdAt": "2026-06-28T18:00:00.000Z",
      "updatedAt": "2026-06-28T18:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Detail / Create / Update / Delete Tipe
```json
{
  "success": true,
  "message": "Tipe berhasil diperbarui",
  "data": {
    "id": "tipe-uuid-1",
    "name": "Avanza",
    "isActive": true,
    "merekId": "merek-uuid-1",
    "createdAt": "2026-06-28T18:00:00.000Z",
    "updatedAt": "2026-06-28T18:00:00.000Z"
  }
}
```
Catatan:
- Kombinasi nama tipe dan `merekId` harus unik. Jika nama tipe sudah digunakan pada merek tersebut, server mengembalikan error `409` dengan code `TIPE_ALREADY_EXISTS`.

---

## 11. Module Vendor

### 11.1 Fungsi
Module vendor digunakan untuk mengelola data vendor pendukung ekosistem.

### 11.2 Endpoint
| Method | Endpoint | Fungsi | Permission Code |
|---|---|---|---|
| GET | `/api/v1/vendors` | Ambil daftar vendor | `VENDOR_READ` |
| GET | `/api/v1/vendors/:id` | Ambil detail vendor | `VENDOR_READ` |
| POST | `/api/v1/vendors` | Buat vendor baru | `VENDOR_CREATE` |
| PATCH | `/api/v1/vendors/:id` | Ubah vendor | `VENDOR_UPDATE` |
| DELETE | `/api/v1/vendors/:id` | Hapus vendor | `VENDOR_DELETE` |

### 11.3 Cara Penggunaan
- Akses dibatasi menggunakan autentikasi (wajib login).
- Endpoint list mendukung query parameters:
  - `page` (default 1)
  - `limit` (default 20)
  - `search` (filter pencarian nama vendor)
  - `isActive` (filter status aktif/tidak aktif, nilai: `true` / `false`)

### 11.4 Request
#### Create / Update Vendor
```json
{
  "name": "Vendor A",
  "address": "Jl. Sudirman No 1",
  "phone": "08123456789",
  "isActive": true
}
```
Aturan input:
- `name` wajib saat create, minimal 2 karakter.
- `address` opsional (string).
- `phone` opsional (string).
- `isActive` opsional (boolean).

### 11.5 Return
#### List Vendor
```json
{
  "success": true,
  "message": "Daftar vendor berhasil diambil",
  "data": [
    {
      "id": "vendor-uuid-1",
      "name": "Vendor A",
      "address": "Jl. Sudirman No 1",
      "phone": "08123456789",
      "isActive": true,
      "createdAt": "2026-06-28T18:00:00.000Z",
      "updatedAt": "2026-06-28T18:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Detail / Create / Update / Delete Vendor
```json
{
  "success": true,
  "message": "Vendor berhasil diperbarui",
  "data": {
    "id": "vendor-uuid-1",
    "name": "Vendor A",
    "address": "Jl. Sudirman No 1",
    "phone": "08123456789",
    "isActive": true,
    "createdAt": "2026-06-28T18:00:00.000Z",
    "updatedAt": "2026-06-28T18:00:00.000Z"
  }
}
```

---

## 12. Module Branch & Media

### 12.1 Fungsi
Module ini digunakan untuk mengelola data master kantor cabang (Branch), menangani pengunggahan gambar (image) untuk Branch menggunakan `multipart/form-data`, serta menyediakan endpoint publik/privat untuk mengakses file gambar tanpa mengekspos lokasi path fisik server.

### 12.2 Endpoint
| Method | Endpoint | Fungsi | Permission Code |
|---|---|---|---|
| GET | `/api/v1/branches` | Ambil daftar branch | `BRANCH_READ` |
| GET | `/api/v1/branches/:id` | Ambil detail branch | `BRANCH_READ` |
| POST | `/api/v1/branches` | Buat branch baru | `BRANCH_CREATE` |
| PATCH | `/api/v1/branches/:id` | Ubah branch | `BRANCH_UPDATE` |
| DELETE | `/api/v1/branches/:id` | Hapus branch | `BRANCH_DELETE` |
| POST | `/api/v1/branches/:id/images` | Upload gambar baru untuk branch | `BRANCH_UPDATE` |
| DELETE | `/api/v1/branches/:id/images/:imageId` | Hapus gambar branch | `BRANCH_UPDATE` |
| GET | `/m/:idfile` | Akses/tampilkan file gambar (Public Media API) |  |

### 12.3 Cara Penggunaan
- **Branch CRUD**:
  - Akses dibatasi menggunakan autentikasi dan permission:
    - `BRANCH_READ` (GET `/` dan `/:id`)
    - `BRANCH_CREATE` (POST `/`)
    - `BRANCH_UPDATE` (PATCH `/:id`)
    - `BRANCH_DELETE` (DELETE `/:id`)
  - Endpoint list mendukung query parameters:
    - `page` (default 1)
    - `limit` (default 20)
    - `search` (filter pencarian nama atau kode branch)
- **Upload Gambar (Branch)**: 
  - Kirim request POST ke `/api/v1/branches/:id/images` menggunakan format `multipart/form-data` with field `image` berisi file gambar (JPG/PNG). Membutuhkan permission `BRANCH_UPDATE`.
- **Akses Gambar (Media)**: 
  - API mengembalikan field `url` berformat `/m/UUID` untuk file gambar yang terunggah. URL ini dapat langsung diakses secara publik tanpa autentikasi (Public Media API).
- **Keamanan**: Nama file fisik di server akan diganti menjadi UUID unik secara otomatis, dan letak direktori penyimpanan asli disembunyikan.

### 12.4 Request
#### Create / Update Branch
```json
{
  "nama": "Branch Bandung",
  "code": "BDG",
  "picId": "user-uuid-1",
  "lokasi": "Jl. Merdeka No. 12",
  "longlat": "-6.917464,107.619122",
  "kontak": "08123456789"
}
```
Aturan input:
- `nama` wajib saat create, minimal 2 karakter.
- `code` wajib saat create, minimal 2 dan maksimal 50 karakter. Format code harus uppercase, alphanumeric, underscore, atau dash (`/^[A-Z][A-Z0-9_-]*$/`) dan akan dinormalisasi ke uppercase.
- `picId` wajib saat create, berisi UUID user PIC yang terdaftar dan aktif. Jika PIC tidak aktif, server mengembalikan error `409` (`PIC_INACTIVE`). Jika tidak ditemukan, mengembalikan error `404` (`PIC_NOT_FOUND`).
- `lokasi` wajib saat create, minimal 2 karakter.
- `longlat` wajib saat create, minimal 3 karakter.
- `kontak` wajib saat create, minimal 3 dan maksimal 50 karakter.

### 12.5 Return
#### List Branch
```json
{
  "success": true,
  "message": "Daftar branch berhasil diambil",
  "data": [
    {
      "id": "branch-uuid-1",
      "nama": "Branch Bandung",
      "code": "BDG",
      "lokasi": "Jl. Merdeka No. 12",
      "longlat": "-6.917464,107.619122",
      "kontak": "08123456789",
      "picId": "user-uuid-1",
      "createdAt": "2026-06-28T18:00:00.000Z",
      "updatedAt": "2026-06-28T18:00:00.000Z",
      "images": [
        {
          "id": "image-uuid-1",
          "filename": "f62b1...jpg",
          "originalName": "foto_kantor.jpg",
          "extension": ".jpg",
          "branchId": "branch-uuid-1",
          "url": "/m/image-uuid-1",
          "createdAt": "2026-06-28T18:05:00.000Z",
          "updatedAt": "2026-06-28T18:05:00.000Z"
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Upload Image Branch Sukses
```json
{
  "success": true,
  "message": "Gambar branch berhasil ditambahkan",
  "data": {
    "id": "image-uuid-1",
    "filename": "f62b1...jpg",
    "originalName": "foto_kantor.jpg",
    "extension": ".jpg",
    "branchId": "branch-uuid-1",
    "url": "/m/image-uuid-1"
  }
}
```

---

## 13. Module Leasing

### 13.1 Fungsi
Module ini digunakan untuk mengelola data master Leasing.

### 13.2 Endpoint
| Method | Endpoint | Fungsi | Permission Code |
|---|---|---|---|
| GET | `/api/v1/leasings` | Ambil daftar Leasing | `LEASING_READ` |
| GET | `/api/v1/leasings/:id` | Ambil detail Leasing | `LEASING_READ` |
| POST | `/api/v1/leasings` | Buat Leasing baru | `LEASING_CREATE` |
| PATCH | `/api/v1/leasings/:id` | Ubah Leasing | `LEASING_UPDATE` |
| DELETE | `/api/v1/leasings/:id` | Hapus Leasing | `LEASING_DELETE` |

### 13.3 Cara Penggunaan
- Akses dibatasi menggunakan autentikasi (wajib login).
- Endpoint list mendukung query parameters:
  - `page` (default 1)
  - `limit` (default 20)
  - `search` (filter pencarian nama atau kode leasing)

### 13.4 Request
#### Create / Update Leasing
```json
{
  "name": "Contoh Leasing",
  "code": "L001",
  "isActive": true
}
```
Aturan input:
- `name` wajib saat create, minimal 2 karakter.
- `code` wajib saat create, minimal 2 dan maksimal 50 karakter, akan dinormalisasi ke uppercase.
- `isActive` opsional (boolean).

### 13.5 Return
#### List Leasing
```json
{
  "success": true,
  "message": "Daftar leasing berhasil diambil",
  "data": [
    {
      "id": "leasing-uuid-1",
      "name": "Contoh Leasing",
      "code": "L001",
      "isActive": true,
      "createdAt": "2026-06-28T18:00:00.000Z",
      "updatedAt": "2026-06-28T18:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Detail / Create / Update / Delete Leasing
```json
{
  "success": true,
  "message": "Leasing berhasil diperbarui",
  "data": {
    "id": "leasing-uuid-1",
    "name": "Contoh Leasing",
    "code": "L001",
    "isActive": true,
    "createdAt": "2026-06-28T18:00:00.000Z",
    "updatedAt": "2026-06-28T18:00:00.000Z"
  }
}
```
Catatan:
- Jika kode leasing sudah digunakan, server mengembalikan error `409` dengan code `CODE_ALREADY_EXISTS`.

---

## 14. Module Sumber Lead

### 14.1 Fungsi
Module ini digunakan untuk mengelola data master Sumber Lead.

### 14.2 Endpoint
| Method | Endpoint | Fungsi | Permission Code |
|---|---|---|---|
| GET | `/api/v1/sumber-leads` | Ambil daftar Sumber Lead | `SUMBER_LEAD_READ` |
| GET | `/api/v1/sumber-leads/:id` | Ambil detail Sumber Lead | `SUMBER_LEAD_READ` |
| POST | `/api/v1/sumber-leads` | Buat Sumber Lead baru | `SUMBER_LEAD_CREATE` |
| PATCH | `/api/v1/sumber-leads/:id` | Ubah Sumber Lead | `SUMBER_LEAD_UPDATE` |
| DELETE | `/api/v1/sumber-leads/:id` | Hapus Sumber Lead | `SUMBER_LEAD_DELETE` |

### 14.3 Cara Penggunaan
- Akses dibatasi menggunakan autentikasi (wajib login).
- Endpoint list mendukung query parameters:
  - `page` (default 1)
  - `limit` (default 20)
  - `search` (filter pencarian nama atau kode sumber lead)

### 14.4 Request
#### Create / Update Sumber Lead
```json
{
  "name": "Contoh Sumber Lead",
  "code": "SL001",
  "isActive": true
}
```
Aturan input:
- `name` wajib saat create, minimal 2 karakter.
- `code` wajib saat create, minimal 2 dan maksimal 50 karakter, akan dinormalisasi ke uppercase.
- `isActive` opsional (boolean).

### 14.5 Return
#### List Sumber Lead
```json
{
  "success": true,
  "message": "Daftar sumber lead berhasil diambil",
  "data": [
    {
      "id": "sumber-lead-uuid-1",
      "name": "Contoh Sumber Lead",
      "code": "SL001",
      "isActive": true,
      "createdAt": "2026-06-28T18:00:00.000Z",
      "updatedAt": "2026-06-28T18:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Detail / Create / Update / Delete Sumber Lead
```json
{
  "success": true,
  "message": "Sumber lead berhasil diperbarui",
  "data": {
    "id": "sumber-lead-uuid-1",
    "name": "Contoh Sumber Lead",
    "code": "SL001",
    "isActive": true,
    "createdAt": "2026-06-28T18:00:00.000Z",
    "updatedAt": "2026-06-28T18:00:00.000Z"
  }
}
```
Catatan:
- Jika kode sumber lead sudah digunakan, server mengembalikan error `409` dengan code `CODE_ALREADY_EXISTS`.

---

## 15. Module Pengecekan

### 15.1 Fungsi
Module ini digunakan untuk mengelola data master Pengecekan.

### 15.2 Endpoint
| Method | Endpoint | Fungsi | Permission Code |
|---|---|---|---|
| GET | `/api/v1/pengecekans` | Ambil daftar Pengecekan | `PENGECEKAN_READ` |
| GET | `/api/v1/pengecekans/:id` | Ambil detail Pengecekan | `PENGECEKAN_READ` |
| POST | `/api/v1/pengecekans` | Buat Pengecekan baru | `PENGECEKAN_CREATE` |
| PATCH | `/api/v1/pengecekans/:id` | Ubah Pengecekan | `PENGECEKAN_UPDATE` |
| DELETE | `/api/v1/pengecekans/:id` | Hapus Pengecekan | `PENGECEKAN_DELETE` |

### 15.3 Cara Penggunaan
- Akses dibatasi menggunakan autentikasi (wajib login).
- Endpoint list mendukung query parameters:
  - `page` (default 1)
  - `limit` (default 20)
  - `search` (filter pencarian nama atau kode pengecekan)

### 15.4 Request
#### Create / Update Pengecekan
```json
{
  "name": "Contoh Pengecekan",
  "code": "P001",
  "isActive": true
}
```
Aturan input:
- `name` wajib saat create, minimal 2 karakter.
- `code` wajib saat create, minimal 2 dan maksimal 50 karakter, akan dinormalisasi ke uppercase.
- `isActive` opsional (boolean).

### 15.5 Return
#### List Pengecekan
```json
{
  "success": true,
  "message": "Daftar pengecekan berhasil diambil",
  "data": [
    {
      "id": "pengecekan-uuid-1",
      "name": "Contoh Pengecekan",
      "code": "P001",
      "isActive": true,
      "createdAt": "2026-06-28T18:00:00.000Z",
      "updatedAt": "2026-06-28T18:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Detail / Create / Update / Delete Pengecekan
```json
{
  "success": true,
  "message": "Pengecekan berhasil diperbarui",
  "data": {
    "id": "pengecekan-uuid-1",
    "name": "Contoh Pengecekan",
    "code": "P001",
    "isActive": true,
    "createdAt": "2026-06-28T18:00:00.000Z",
    "updatedAt": "2026-06-28T18:00:00.000Z"
  }
}
```
Catatan:
- Jika kode pengecekan sudah digunakan, server mengembalikan error `409` dengan code `CODE_ALREADY_EXISTS`.

---

## 16. Module Kategori Pengeluaran

### 16.1 Fungsi
Module ini digunakan untuk mengelola data master Kategori Pengeluaran.

### 16.2 Endpoint
| Method | Endpoint | Fungsi | Permission Code |
|---|---|---|---|
| GET | `/api/v1/kategori-pengeluarans` | Ambil daftar Kategori Pengeluaran | `KATEGORI_PENGELUARAN_READ` |
| GET | `/api/v1/kategori-pengeluarans/:id` | Ambil detail Kategori Pengeluaran | `KATEGORI_PENGELUARAN_READ` |
| POST | `/api/v1/kategori-pengeluarans` | Buat Kategori Pengeluaran baru | `KATEGORI_PENGELUARAN_CREATE` |
| PATCH | `/api/v1/kategori-pengeluarans/:id` | Ubah Kategori Pengeluaran | `KATEGORI_PENGELUARAN_UPDATE` |
| DELETE | `/api/v1/kategori-pengeluarans/:id` | Hapus Kategori Pengeluaran | `KATEGORI_PENGELUARAN_DELETE` |

### 16.3 Cara Penggunaan
- Akses dibatasi menggunakan autentikasi (wajib login).
- Endpoint list mendukung query parameters:
  - `page` (default 1)
  - `limit` (default 20)
  - `search` (filter pencarian nama atau kode kategori pengeluaran)

### 16.4 Request
#### Create / Update Kategori Pengeluaran
```json
{
  "name": "Contoh Kategori Pengeluaran",
  "code": "KP001",
  "isActive": true
}
```
Aturan input:
- `name` wajib saat create, minimal 2 karakter.
- `code` wajib saat create, minimal 2 dan maksimal 50 karakter, akan dinormalisasi ke uppercase.
- `isActive` opsional (boolean).

### 16.5 Return
#### List Kategori Pengeluaran
```json
{
  "success": true,
  "message": "Daftar kategori pengeluaran berhasil diambil",
  "data": [
    {
      "id": "kategori-pengeluaran-uuid-1",
      "name": "Contoh Kategori Pengeluaran",
      "code": "KP001",
      "isActive": true,
      "createdAt": "2026-06-28T18:00:00.000Z",
      "updatedAt": "2026-06-28T18:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Detail / Create / Update / Delete Kategori Pengeluaran
```json
{
  "success": true,
  "message": "Kategori pengeluaran berhasil diperbarui",
  "data": {
    "id": "kategori-pengeluaran-uuid-1",
    "name": "Contoh Kategori Pengeluaran",
    "code": "KP001",
    "isActive": true,
    "createdAt": "2026-06-28T18:00:00.000Z",
    "updatedAt": "2026-06-28T18:00:00.000Z"
  }
}
```
Catatan:
- Jika kode kategori pengeluaran sudah digunakan, server mengembalikan error `409` dengan code `CODE_ALREADY_EXISTS`.

---

## 17. Module Metode Pembayaran

### 17.1 Fungsi
Module ini digunakan untuk mengelola data master Metode Pembayaran.

### 17.2 Endpoint
| Method | Endpoint | Fungsi | Permission Code |
|---|---|---|---|
| GET | `/api/v1/metode-pembayarans` | Ambil daftar Metode Pembayaran | `METODE_PEMBAYARAN_READ` |
| GET | `/api/v1/metode-pembayarans/:id` | Ambil detail Metode Pembayaran | `METODE_PEMBAYARAN_READ` |
| POST | `/api/v1/metode-pembayarans` | Buat Metode Pembayaran baru | `METODE_PEMBAYARAN_CREATE` |
| PATCH | `/api/v1/metode-pembayarans/:id` | Ubah Metode Pembayaran | `METODE_PEMBAYARAN_UPDATE` |
| DELETE | `/api/v1/metode-pembayarans/:id` | Hapus Metode Pembayaran | `METODE_PEMBAYARAN_DELETE` |

### 17.3 Cara Penggunaan
- Akses dibatasi menggunakan autentikasi (wajib login).
- Endpoint list mendukung query parameters:
  - `page` (default 1)
  - `limit` (default 20)
  - `search` (filter pencarian nama atau kode metode pembayaran)

### 17.4 Request
#### Create / Update Metode Pembayaran
```json
{
  "name": "Contoh Metode Pembayaran",
  "code": "MP001",
  "isActive": true
}
```
Aturan input:
- `name` wajib saat create, minimal 2 karakter.
- `code` wajib saat create, minimal 2 dan maksimal 50 karakter, akan dinormalisasi ke uppercase.
- `isActive` opsional (boolean).

### 17.5 Return
#### List Metode Pembayaran
```json
{
  "success": true,
  "message": "Daftar metode pembayaran berhasil diambil",
  "data": [
    {
      "id": "metode-pembayaran-uuid-1",
      "name": "Contoh Metode Pembayaran",
      "code": "MP001",
      "isActive": true,
      "createdAt": "2026-06-28T18:00:00.000Z",
      "updatedAt": "2026-06-28T18:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Detail / Create / Update / Delete Metode Pembayaran
```json
{
  "success": true,
  "message": "Metode pembayaran berhasil diperbarui",
  "data": {
    "id": "metode-pembayaran-uuid-1",
    "name": "Contoh Metode Pembayaran",
    "code": "MP001",
    "isActive": true,
    "createdAt": "2026-06-28T18:00:00.000Z",
    "updatedAt": "2026-06-28T18:00:00.000Z"
  }
}
```
Catatan:
- Jika kode metode pembayaran sudah digunakan, server mengembalikan error `409` dengan code `CODE_ALREADY_EXISTS`.

---

## 18. Module Dokumen

### 18.1 Fungsi
Module ini digunakan untuk mengelola data master Dokumen.

### 18.2 Endpoint
| Method | Endpoint | Fungsi | Permission Code |
|---|---|---|---|
| GET | `/api/v1/dokumens` | Ambil daftar Dokumen | `DOKUMEN_READ` |
| GET | `/api/v1/dokumens/:id` | Ambil detail Dokumen | `DOKUMEN_READ` |
| POST | `/api/v1/dokumens` | Buat Dokumen baru | `DOKUMEN_CREATE` |
| PATCH | `/api/v1/dokumens/:id` | Ubah Dokumen | `DOKUMEN_UPDATE` |
| DELETE | `/api/v1/dokumens/:id` | Hapus Dokumen | `DOKUMEN_DELETE` |

### 18.3 Cara Penggunaan
- Akses dibatasi menggunakan autentikasi (wajib login).
- Endpoint list mendukung query parameters:
  - `page` (default 1)
  - `limit` (default 20)
  - `search` (filter pencarian nama atau kode dokumen)

### 18.4 Request
#### Create / Update Dokumen
```json
{
  "name": "Contoh Dokumen",
  "code": "D001",
  "isActive": true
}
```
Aturan input:
- `name` wajib saat create, minimal 2 karakter.
- `code` wajib saat create, minimal 2 dan maksimal 50 karakter, akan dinormalisasi ke uppercase.
- `isActive` opsional (boolean).

### 18.5 Return
#### List Dokumen
```json
{
  "success": true,
  "message": "Daftar dokumen berhasil diambil",
  "data": [
    {
      "id": "dokumen-uuid-1",
      "name": "Contoh Dokumen",
      "code": "D001",
      "isActive": true,
      "createdAt": "2026-06-28T18:00:00.000Z",
      "updatedAt": "2026-06-28T18:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Detail / Create / Update / Delete Dokumen
```json
{
  "success": true,
  "message": "Dokumen berhasil diperbarui",
  "data": {
    "id": "dokumen-uuid-1",
    "name": "Contoh Dokumen",
    "code": "D001",
    "isActive": true,
    "createdAt": "2026-06-28T18:00:00.000Z",
    "updatedAt": "2026-06-28T18:00:00.000Z"
  }
}
```
Catatan:
- Jika kode dokumen sudah digunakan, server mengembalikan error `409` dengan code `CODE_ALREADY_EXISTS`.

---

## 19. Module Perlengkapan

### 19.1 Fungsi
Module ini digunakan untuk mengelola data master Perlengkapan.

### 19.2 Endpoint
| Method | Endpoint | Fungsi | Permission Code |
|---|---|---|---|
| GET | `/api/v1/perlengkapans` | Ambil daftar Perlengkapan | `PERLENGKAPAN_READ` |
| GET | `/api/v1/perlengkapans/:id` | Ambil detail Perlengkapan | `PERLENGKAPAN_READ` |
| POST | `/api/v1/perlengkapans` | Buat Perlengkapan baru | `PERLENGKAPAN_CREATE` |
| PATCH | `/api/v1/perlengkapans/:id` | Ubah Perlengkapan | `PERLENGKAPAN_UPDATE` |
| DELETE | `/api/v1/perlengkapans/:id` | Hapus Perlengkapan | `PERLENGKAPAN_DELETE` |

### 19.3 Cara Penggunaan
- Akses dibatasi menggunakan autentikasi (wajib login).
- Endpoint list mendukung query parameters:
  - `page` (default 1)
  - `limit` (default 20)
  - `search` (filter pencarian nama atau kode perlengkapan)

### 19.4 Request
#### Create / Update Perlengkapan
```json
{
  "name": "Contoh Perlengkapan",
  "code": "P002",
  "isActive": true
}
```
Aturan input:
- `name` wajib saat create, minimal 2 karakter.
- `code` wajib saat create, minimal 2 dan maksimal 50 karakter, akan dinormalisasi ke uppercase.
- `isActive` opsional (boolean).

### 19.5 Return
#### List Perlengkapan
```json
{
  "success": true,
  "message": "Daftar perlengkapan berhasil diambil",
  "data": [
    {
      "id": "perlengkapan-uuid-1",
      "name": "Contoh Perlengkapan",
      "code": "P002",
      "isActive": true,
      "createdAt": "2026-06-28T18:00:00.000Z",
      "updatedAt": "2026-06-28T18:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Detail / Create / Update / Delete Perlengkapan
```json
{
  "success": true,
  "message": "Perlengkapan berhasil diperbarui",
  "data": {
    "id": "perlengkapan-uuid-1",
    "name": "Contoh Perlengkapan",
    "code": "P002",
    "isActive": true,
    "createdAt": "2026-06-28T18:00:00.000Z",
    "updatedAt": "2026-06-28T18:00:00.000Z"
  }
}
```

---

## 20. Module Investor & Investor Modal

### 20.1 Fungsi
Module ini digunakan untuk mengelola data master Investor serta rincian Modal Investor (nested entity).

### 20.2 Endpoint

#### Investor
| Method | Endpoint | Fungsi | Permission Code |
|---|---|---|---|
| GET | `/api/v1/investors` | Ambil daftar Investor | `INVESTOR_READ` |
| GET | `/api/v1/investors/:id` | Ambil detail Investor | `INVESTOR_READ` |
| POST | `/api/v1/investors` | Buat Investor baru | `INVESTOR_CREATE` |
| PATCH | `/api/v1/investors/:id` | Ubah Investor | `INVESTOR_UPDATE` |
| DELETE | `/api/v1/investors/:id` | Hapus Investor | `INVESTOR_DELETE` |

#### Investor Modal
| Method | Endpoint | Fungsi | Permission Code |
|---|---|---|---|
| GET | `/api/v1/investors/:investorId/modals` | Ambil daftar Modal Investor | `INVESTOR_MODAL_READ` |
| GET | `/api/v1/investors/:investorId/modals/:id` | Ambil detail Modal Investor | `INVESTOR_MODAL_READ` |
| POST | `/api/v1/investors/:investorId/modals` | Buat Modal Investor baru | `INVESTOR_MODAL_CREATE` |
| PATCH | `/api/v1/investors/:investorId/modals/:id` | Ubah Modal Investor | `INVESTOR_MODAL_UPDATE` |
| DELETE | `/api/v1/investors/:investorId/modals/:id` | Hapus Modal Investor | `INVESTOR_MODAL_DELETE` |

### 20.3 Cara Penggunaan
- Akses dibatasi menggunakan autentikasi (wajib login).
- Endpoint modal investor menggunakan parameter `:investorId` pada path URL.
- Endpoint list mendukung query parameters: `page`, `limit`, `search`, `isActive`.

### 20.4 Request

#### Create / Update Investor
```json
{
  "name": "Budi Investor",
  "code": "INV-001",
  "bankName": "BCA",
  "bankAccount": "1234567890",
  "bankAccountName": "BUDI SANTOSO",
  "isActive": true
}
```
Aturan input:
- `name` wajib saat create, minimal 2 karakter.
- `code` wajib saat create, minimal 2 dan maksimal 50 karakter, dinormalisasi ke uppercase.
- `bankName` wajib saat create (nama bank).
- `bankAccount` wajib saat create (nomor rekening).
- `bankAccountName` wajib saat create (atas nama rekening).
- `isActive` opsional.

#### Create / Update Investor Modal
```json
{
  "amount": 100000000,
  "profitSharingType": "percentage",
  "profitSharing": 15.5,
  "profitSharingDate": "2026-07-01T00:00:00.000Z",
  "shareStart": "2026-06",
  "shareEnd": null,
  "isActive": true
}
```
Aturan input:
- `amount` wajib saat create, nilai >= 0.
- `profitSharingType` wajib saat create, bernilai `percentage` atau `fixed`.
- `profitSharing` wajib saat create, nilai >= 0.
- `profitSharingDate` opsional, tanggal (ISO format) untuk jadwal pembagian profit sharing.
- `shareStart` wajib saat create, format `"YYYY-MM"`.
- `shareEnd` opsional, format `"YYYY-MM"`, bisa `null` (artinya ongoing tanpa batas akhir).
- `isActive` opsional.

### 20.5 Return

#### List Investor / Modal Investor
```json
{
  "success": true,
  "message": "Daftar berhasil diambil",
  "data": [
    { ... }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Detail / Create / Update / Delete
```json
{
  "success": true,
  "message": "Operasi berhasil",
  "data": { ... }
}
```
Catatan:
- Jika kode perlengkapan sudah digunakan, server mengembalikan error `409` dengan code `CODE_ALREADY_EXISTS`.
