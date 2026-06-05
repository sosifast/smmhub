# Dokumentasi API Backend Mobile - SMMHub

Dokumentasi ini menjelaskan rute API RESTful khusus mobile yang terletak di dalam folder [app/api-mobile](file:///Volumes/Project/NextJs/smmhub/app/api-mobile). Seluruh API ini berkomunikasi langsung dengan database Supabase secara real-time.

**Base URL**: `https://smmhub-mu.vercel.app/api-mobile` (Produksi)

## Daftar Berkas & Rute API
Berikut adalah daftar modul API beserta berkas implementasinya:
* **Autentikasi (`/auth`)**:
  * Registrasi: `/auth/register` &rarr; [register/route.ts](file:///Volumes/Project/NextJs/smmhub/app/api-mobile/auth/register/route.ts)
  * Login: `/auth/login` &rarr; [login/route.ts](file:///Volumes/Project/NextJs/smmhub/app/api-mobile/auth/login/route.ts)
  * Reset Password: `/auth/reset` &rarr; [reset/route.ts](file:///Volumes/Project/NextJs/smmhub/app/api-mobile/auth/reset/route.ts)
* **Kunci API (`/data-apikey`)**:
  * CRUD: `/data-apikey` &rarr; [data-apikey/route.ts](file:///Volumes/Project/NextJs/smmhub/app/api-mobile/data-apikey/route.ts)
* **Sesi Login (`/session`)**:
  * Validasi & Simpan Sesi: `/session` &rarr; [session/route.ts](file:///Volumes/Project/NextJs/smmhub/app/api-mobile/session/route.ts)

---

## 1. Modul Autentikasi (`/auth`)

### 1.1 Registrasi Pengguna Baru
Mendaftarkan akun baru dengan tingkat hak akses dasar (`Member`) dan status aktif (`Active`).

* **File Sumber**: [app/api-mobile/auth/register/route.ts](file:///Volumes/Project/NextJs/smmhub/app/api-mobile/auth/register/route.ts)
* **Endpoint**: `/auth/register`
* **Metode**: `POST`
* **Headers**:
  * `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "full_name": "Nama Lengkap Pengguna",
    "email": "nama.pengguna@example.com",
    "password": "kataSandiMinimal6Karakter"
  }
  ```
* **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully.",
    "data": {
      "id": "e8a946c1-...",
      "full_name": "Nama Lengkap Pengguna",
      "email": "nama.pengguna@example.com",
      "level": "Member",
      "status": "Active",
      "create_at": "2026-06-01T08:00:00.000Z"
    }
  }
  ```
* **Response Gagal (400 Bad Request - Field Kurang)**:
  ```json
  {
    "success": false,
    "error": "Missing required fields (full_name, email, password)."
  }
  ```
* **Response Gagal (409 Conflict - Email Duplikat)**:
  ```json
  {
    "success": false,
    "error": "Email address is already registered."
  }
  ```
* **Response Gagal (500 Internal Server Error)**:
  ```json
  {
    "success": false,
    "error": "Pesan kesalahan detail dari database/server."
  }
  ```

---

### 1.2 Masuk Aplikasi (Login)
Melakukan otentikasi alamat email dan kata sandi untuk masuk ke dalam aplikasi.

* **File Sumber**: [app/api-mobile/auth/login/route.ts](file:///Volumes/Project/NextJs/smmhub/app/api-mobile/auth/login/route.ts)
* **Endpoint**: `/auth/login`
* **Metode**: `POST`
* **Headers**:
  * `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "email": "nama.pengguna@example.com",
    "password": "kataSandiPengguna"
  }
  ```
* **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "id": "e8a946c1-...",
      "full_name": "Nama Lengkap Pengguna",
      "email": "nama.pengguna@example.com",
      "level": "Member",
      "status": "Active",
      "create_at": "2026-06-01T08:00:00.000Z"
    }
  }
  ```
* **Response Gagal (400 Bad Request - Parameter Kurang)**:
  ```json
  {
    "success": false,
    "error": "Missing email or password."
  }
  ```
* **Response Gagal (401 Unauthorized - Akun/Sandi Salah)**:
  ```json
  {
    "success": false,
    "error": "Invalid email or password."
  }
  ```
* **Response Gagal (403 Forbidden - Akun Tidak Aktif)**:
  ```json
  {
    "success": false,
    "error": "Your account is currently inactive. Please contact support."
  }
  ```
* **Response Gagal (550 Custom Error - Kesalahan Tak Terduga)**:
  ```json
  {
    "success": false,
    "error": "Pesan kesalahan tak terduga."
  }
  ```

---

### 1.3 Reset Kata Sandi
Mengubah kata sandi pengguna lama dengan kata sandi yang baru berdasarkan verifikasi alamat email.

* **File Sumber**: [app/api-mobile/auth/reset/route.ts](file:///Volumes/Project/NextJs/smmhub/app/api-mobile/auth/reset/route.ts)
* **Endpoint**: `/auth/reset`
* **Metode**: `POST`
* **Headers**:
  * `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "email": "nama.pengguna@example.com",
    "new_password": "kataSandiBaruMin6Karakter"
  }
  ```
* **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Password reset successful."
  }
  ```
* **Response Gagal (400 Bad Request - Parameter Kurang / Terlalu Pendek)**:
  ```json
  {
    "success": false,
    "error": "Missing required fields (email, new_password)."
  }
  ```
  atau:
  ```json
  {
    "success": false,
    "error": "New password must be at least 6 characters."
  }
  ```
* **Response Gagal (404 Not Found - Email Tidak Terdaftar)**:
  ```json
  {
    "success": false,
    "error": "No user accounts match the provided email address."
  }
  ```
* **Response Gagal (500 Internal Server Error)**:
  ```json
  {
    "success": false,
    "error": "Pesan kesalahan sistem."
  }
  ```

---

## 2. Modul Pengelolaan Kunci API (`/data-apikey`)

* **File Sumber**: [app/api-mobile/data-apikey/route.ts](file:///Volumes/Project/NextJs/smmhub/app/api-mobile/data-apikey/route.ts)

### 2.1 Menampilkan Daftar Kunci API
Mengambil semua kunci API yang terdaftar untuk seorang pengguna tertentu.

* **Endpoint**: `/data-apikey?id_user={uuid_pengguna}`
* **Metode**: `GET`
* **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "d7480b2a-...",
        "id_user": "e8a946c1-...",
        "name": "Gateway Produksi Utama",
        "api_key": "smm_live_4a8df9e81b2c3...",
        "secret_key": "Read/Write",
        "balance": 150.00,
        "status": "Active",
        "code": "SMM",
        "api_id": "api_8247",
        "url": "https://api.smmhub.com/v1",
        "create_at": "2026-06-01T08:10:00.000Z",
        "update_at": "2026-06-01T08:10:00.000Z",
        "user": {
          "email": "nama.pengguna@example.com",
          "full_name": "Nama Lengkap Pengguna"
        }
      }
    ]
  }
  ```
* **Response Gagal (400 Bad Request - Parameter Kurang)**:
  ```json
  {
    "success": false,
    "error": "Missing required query parameter: id_user."
  }
  ```
* **Response Gagal (500 Internal Server Error)**:
  ```json
  {
    "success": false,
    "error": "Pesan kesalahan sistem."
  }
  ```

---

### 2.2 Membuat/Menghasilkan Kunci API Baru
Membuat kunci token acak dengan prefiks `smm_live_...` untuk pengguna yang dipilih.

* **Endpoint**: `/data-apikey`
* **Metode**: `POST`
* **Headers**:
  * `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "id_user": "uuid_pengguna_pemilik_key",
    "name": "Label Nama Kunci API",
    "code": "SMM",               // Opsional (Default: SMM)
    "url": "https://api.smmhub.com", // Opsional
    "balance": 100               // Opsional (Default: 100.00)
  }
  ```
* **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "API Key generated successfully.",
    "data": {
      "id": "d7480b2a-...",
      "id_user": "e8a946c1-...",
      "name": "Label Nama Kunci API",
      "api_key": "smm_live_8f3c7a...",
      "secret_key": "Read/Write",
      "balance": 100.00,
      "status": "Active",
      "code": "SMM",
      "api_id": "api_4982",
      "url": "https://api.smmhub.com",
      "create_at": "2026-06-01T08:15:00.000Z",
      "update_at": "2026-06-01T08:15:00.000Z"
    }
  }
  ```
* **Response Gagal (400 Bad Request)**:
  ```json
  {
    "success": false,
    "error": "Missing required fields (id_user, name)."
  }
  ```

---

### 2.3 Mengedit Kunci API
Mengubah informasi parameter nama kunci, status keaktifan, saldo, atau alamat URL integrasi.

* **Endpoint**: `/data-apikey`
* **Metode**: `PUT`
* **Headers**:
  * `Content-Type: application/json`
* **Request Body** (Hanya sertakan kolom yang ingin diperbarui):
  ```json
  {
    "id": "uuid_kunci_api",
    "name": "Nama Kunci Baru",     // Opsional
    "status": "Inactive",          // Opsional ('Active' / 'Inactive' / 'Not-Active')
    "balance": 250.00,             // Opsional
    "url": "https://newapi.com"    // Opsional
  }
  ```
* **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "API Key updated successfully.",
    "data": {
      "id": "uuid_kunci_api",
      "status": "Not-Active", // Disinkronkan dengan CHECK database
      ...
    }
  }
  ```
* **Response Gagal (400 Bad Request)**:
  ```json
  {
    "success": false,
    "error": "Missing required field: id."
  }
  ```

---

### 2.4 Menghapus/Mencabut Kunci API
Mencabut hak akses secara permanen dengan menghapus kunci dari database.

* **Endpoint**: `/data-apikey?id={uuid_kunci_api}`
* **Metode**: `DELETE`
* **Alternatif Body**: `{ "id": "uuid_kunci_api" }`
* **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "API Key revoked successfully."
  }
  ```
* **Response Gagal (400 Bad Request)**:
  ```json
  {
    "success": false,
    "error": "Missing required parameter: id."
  }
  ```

---

## 3. Modul Pengelolaan Sesi Login (`/session`)

* **File Sumber**: [app/api-mobile/session/route.ts](file:///Volumes/Project/NextJs/smmhub/app/api-mobile/session/route.ts)

### 3.1 Memvalidasi Status Sesi Aktif
Memeriksa apakah sesi login pengguna masih aktif (belum log out dan belum kedaluwarsa).

* **Endpoint**: `/session?id={uuid_sesi}`
* **Metode**: `GET`
* **Response Sesi Aktif (200 OK)**:
  ```json
  {
    "success": true,
    "active": true,
    "data": {
      "id": "b3e945c1-...",
      "id_user": "e8a946c1-...",
      "status": "Login",
      "expired_at": "2026-07-01T08:00:00.000Z",
      "session_data": {
        "ip": "192.168.1.1",
        "device": "Android Mobile Phone",
        "user_agent": "Mozilla/5.0..."
      },
      "user": {
        "email": "nama.pengguna@example.com",
        "full_name": "Nama Lengkap Pengguna"
      }
    }
  }
  ```
* **Response Sesi Tidak Aktif / Kedaluwarsa (200 OK)**:
  ```json
  {
    "success": true,
    "active": false,
    "data": {
      "id": "b3e945c1-...",
      "status": "Logout", // atau expired_at sudah terlewati
      ...
    }
  }
  ```
* **Response Sesi Tidak Ditemukan (404 Not Found)**:
  ```json
  {
    "success": false,
    "active": false,
    "error": "Session not found."
  }
  ```

---

### 3.2 Mencatat Sesi Login Baru
Menyimpan sesi login baru sesaat setelah otentikasi berhasil pada klien mobile.

* **Endpoint**: `/session`
* **Metode**: `POST`
* **Headers**:
  * `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "id_user": "uuid_pengguna",
    "session_data": {              // Opsional (Bisa berisi info IP/Device)
      "ip": "114.122.10.15",
      "device": "iOS iPhone 15 Pro",
      "user_agent": "Dart/3.0 (mobile)"
    },
    "expired_at": "2026-07-01T15:00:00.000Z" // Opsional (Default: +30 Hari)
  }
  ```
* **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Session registered successfully.",
    "data": {
      "id": "b3e945c1-...",
      "id_user": "uuid_pengguna",
      "session_data": { ... },
      "status": "Login",
      "expired_at": "2026-07-01T15:00:00.000Z",
      "create_at": "2026-06-01T15:00:00.000Z",
      "update_at": "2026-06-01T15:00:00.000Z"
    }
  }
  ```
* **Response Gagal (400 Bad Request)**:
  ```json
  {
    "success": false,
    "error": "Missing required field: id_user."
  }
  ```

---

### 3.3 Mengupdate Status Sesi (Logout)
Mengakhiri masa berlaku sesi login (Logout) pada perangkat mobile.

* **Endpoint**: `/session`
* **Metode**: `PUT`
* **Headers**:
  * `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "id": "uuid_sesi",
    "status": "Logout" // Status yang diperbarui ('Login' atau 'Logout')
  }
  ```
* **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Session status updated successfully.",
    "data": {
      "id": "uuid_sesi",
      "status": "Logout",
      ...
    }
  }
  ```
* **Response Gagal (400 Bad Request)**:
  ```json
  {
    "success": false,
    "error": "Missing required field: id."
  }
  ```

