# Panduan Integrasi Frontend E-Catalogue

## 1. Konfigurasi Dasar

Base URL development:

```text
http://localhost:3000/api/v1
```

Semua response menggunakan format:

```json
{
  "success": true,
  "message": "Request berhasil",
  "data": {}
}
```

Request yang dilindungi wajib mengirim:

```http
Authorization: Bearer <access-token>
Content-Type: application/json
```

## 2. Module yang Tersedia

### Authentication

| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/auth/login` | Login dengan username atau email |
| `POST` | `/auth/refresh` | Mengganti access token dan refresh token |
| `GET` | `/auth/me` | Mengambil user, permission, dan navigasi terbaru |
| `POST` | `/auth/logout` | Logout dari session aktif |
| `POST` | `/auth/logout-all` | Logout dari seluruh perangkat |

Form login:

```json
{
  "identifier": "admin",
  "password": "password-admin"
}
```

Setelah login, frontend perlu menyimpan:

- `accessToken`
- `refreshToken`
- `refreshExpiresAt`
- data `user`
- `permissionCodes`
- `groupMenus`

### Group Menu

Group Menu adalah kelompok navigasi. Contoh: `Master Data`.

| Method | Endpoint | Permission |
|---|---|---|
| `GET` | `/menus/groups` | `MENU_READ` |
| `GET` | `/menus/groups/:groupId` | `MENU_READ` |
| `POST` | `/menus/groups` | `MENU_CREATE` |
| `PATCH` | `/menus/groups/:groupId` | `MENU_UPDATE` |
| `DELETE` | `/menus/groups/:groupId` | `MENU_DELETE` |

Form Group Menu:

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

Aturan input:

- `name` dan `code` wajib.
- `code` menggunakan huruf kapital, angka, dan underscore.
- `sortOrder` berupa integer minimal `0`.
- Group yang masih memiliki menu tidak dapat dihapus.

### Menu

Menu selalu dibuat di dalam Group Menu.

| Method | Endpoint | Permission |
|---|---|---|
| `POST` | `/menus/groups/:groupId/items` | `MENU_CREATE` |
| `GET` | `/menus/:id` | `MENU_READ` |
| `PATCH` | `/menus/:id` | `MENU_UPDATE` |
| `DELETE` | `/menus/:id` | `MENU_DELETE` |

Form Menu:

```json
{
  "name": "User",
  "code": "USER",
  "description": "Manajemen user",
  "path": "/access-control/users",
  "icon": "users",
  "sortOrder": 10,
  "isActive": true
}
```

Frontend harus memilih Group Menu sebelum membuka form create Menu. Menu tidak dapat dipindahkan ke group lain setelah dibuat.

### Permission

Permission selalu dibuat di dalam Menu.

| Method | Endpoint | Permission |
|---|---|---|
| `POST` | `/menus/:menuId/permissions` | `PERMISSION_MANAGE` |
| `PATCH` | `/menus/:menuId/permissions/:permissionId` | `PERMISSION_MANAGE` |
| `DELETE` | `/menus/:menuId/permissions/:permissionId` | `PERMISSION_MANAGE` |

Form Permission:

```json
{
  "name": "Lihat User",
  "code": "USER_READ",
  "description": "Melihat daftar dan detail user"
}
```

Urutan input pada halaman menu:

1. Buat Group Menu.
2. Pilih Group Menu.
3. Buat Menu di dalam group tersebut.
4. Pilih Menu.
5. Tambahkan Permission.

### Role

| Method | Endpoint | Permission |
|---|---|---|
| `GET` | `/roles` | `ROLE_READ` |
| `GET` | `/roles/:id` | `ROLE_READ` |
| `POST` | `/roles` | `ROLE_CREATE` |
| `PATCH` | `/roles/:id` | `ROLE_UPDATE` |
| `DELETE` | `/roles/:id` | `ROLE_DELETE` |
| `PUT` | `/roles/:id/permissions` | `ROLE_SET_PERMISSION` |

Form Role:

```json
{
  "name": "Sales",
  "code": "SALES",
  "description": "Tim penjualan",
  "isActive": true
}
```

Assignment permission bersifat replacement:

```json
{
  "permissionIds": [
    "permission-uuid-1",
    "permission-uuid-2"
  ]
}
```

Frontend harus mengirim seluruh permission yang tetap ingin dimiliki role. Mengirim array kosong mencabut seluruh permission.

### User

| Method | Endpoint | Permission |
|---|---|---|
| `GET` | `/users` | `USER_READ` |
| `GET` | `/users/:id` | `USER_READ` |
| `POST` | `/users` | `USER_CREATE` |
| `PATCH` | `/users/:id` | `USER_UPDATE` |
| `PUT` | `/users/:id/role` | `USER_SET_ROLE` |
| `DELETE` | `/users/:id` | `USER_DELETE` |

Form User:

```json
{
  "name": "Budi",
  "email": "budi@example.com",
  "username": "budi",
  "password": "password-minimal-8-karakter",
  "roleId": "role-uuid",
  "isActive": true
}
```

Frontend mengambil pilihan role dari `GET /roles`. Password wajib saat create dan opsional saat update.

## 3. Render Sidebar

Login, refresh, dan `/auth/me` mengembalikan navigasi:

```json
{
  "groupMenus": [
    {
      "id": "group-uuid",
      "name": "Master Data",
      "code": "MASTER_DATA",
      "icon": "database",
      "sortOrder": 10,
      "menus": [
        {
          "id": "menu-uuid",
          "name": "User",
          "code": "USER",
          "path": "/access-control/users",
          "icon": "users",
          "sortOrder": 10,
          "permissions": [
            {
              "id": "permission-uuid",
              "name": "Lihat User",
              "code": "USER_READ"
            }
          ]
        }
      ]
    }
  ]
}
```

Frontend cukup melakukan perulangan `groupMenus`, lalu `groupMenu.menus`. Data sudah diurutkan berdasarkan `sortOrder`. Jangan membentuk sidebar dari daftar menu statis karena perubahan permission berlaku langsung dari database.

Gunakan `permissionCodes` untuk menyembunyikan tombol aksi:

```js
const canCreateUser = permissionCodes.includes("USER_CREATE");
```

Backend tetap menjadi sumber keamanan utama. Menyembunyikan tombol di frontend bukan pengganti authorization backend.

## 4. Penggunaan Refresh Token

Access token berlaku singkat, default 15 menit. Refresh token mempertahankan session hingga batas absolut, default 30 hari.

Alur yang disarankan:

1. Kirim request API menggunakan access token.
2. Jika response `401` dengan code `INVALID_ACCESS_TOKEN`, panggil `POST /auth/refresh`.
3. Kirim refresh token yang terakhir tersimpan.
4. Simpan **access token dan refresh token baru** dari response.
5. Ulangi request awal satu kali menggunakan access token baru.
6. Jika refresh gagal, hapus data session frontend dan arahkan user ke halaman login.

Request refresh:

```json
{
  "refreshToken": "refresh-token-terakhir"
}
```

Refresh token menggunakan rotation. Token lama langsung tidak valid setelah refresh berhasil. Karena itu frontend wajib mengganti kedua token secara atomik.

Contoh pola interceptor:

```js
let refreshPromise = null;

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = authApi
      .refresh(getRefreshToken())
      .then(({ accessToken, refreshToken }) => {
        saveTokens({ accessToken, refreshToken });
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}
```

Aturan penting:

- Cegah beberapa request refresh berjalan bersamaan.
- Jangan mencoba refresh ulang jika endpoint `/auth/refresh` sendiri menghasilkan `401`.
- Retry request awal maksimal satu kali.
- `401 INVALID_REFRESH_TOKEN`, `SESSION_REVOKED`, `SESSION_EXPIRED`, atau `USER_INACTIVE` harus mengakhiri session frontend.
- `403 FORBIDDEN` bukan masalah token; tampilkan halaman atau pesan tidak memiliki akses.
- Setelah `logout` atau `logout-all`, hapus seluruh token dan cache profil.

## 5. Penanganan Error

```json
{
  "success": false,
  "message": "Anda tidak memiliki permission untuk melakukan aksi ini",
  "error": {
    "code": "FORBIDDEN",
    "details": null
  }
}
```

Frontend sebaiknya menggunakan `error.code` untuk keputusan program dan `message` untuk informasi pengguna.
