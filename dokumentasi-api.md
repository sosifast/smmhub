# Dokumentasi API Backend Mobile - SMMHub

Dokumentasi ini menjelaskan rute API RESTful khusus mobile. Seluruh API ini berkomunikasi langsung dengan database Supabase secara real-time.

**Base URL**: `https://smmhub-mu.vercel.app/api-mobile` (Produksi)

## Daftar Rute API
Berikut adalah daftar modul API:
* **Autentikasi (`/auth`)**:
  * Registrasi: `/auth/register`
  * Login: `/auth/login`
  * Reset Password: `/auth/reset`
* **Kunci API (`/data-apikey`)**:
  * CRUD: `/data-apikey`
* **Sesi Login (`/session`)**:
  * Validasi & Simpan Sesi: `/session`

---

## 1. Modul Autentikasi (`/auth`)

### 1.1 Registrasi Pengguna Baru
Mendaftarkan akun baru dengan tingkat hak akses dasar (`Member`) dan status aktif (`Active`).

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

### 2.1 Menampilkan Daftar Kunci API
Mengambil semua kunci API yang terdaftar untuk seorang pengguna tertentu, atau detail kunci API spesifik berdasarkan ID.

* **Endpoint**: `/data-apikey?id_user={uuid_pengguna}` ATAU `/data-apikey?id={uuid_kunci_api}`
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
        "secret_key": "secret_xxxxx",
        "balance": 150.00,
        "status": "Active",
        "code": "SMM",
        "api_id": "api_8247",
        "url": "https://api.smmhub.com/v1",
        "create_at": "2026-06-01T08:10:00.000Z",
        "update_at": "2026-06-01T08:10:00.000Z"
      }
    ]
  }
  ```
* **Response Gagal (400 Bad Request - Parameter Kurang)**:
  ```json
  {
    "success": false,
    "error": "Missing parameter: id or id_user must be provided."
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

### 2.2 Membuat Kunci API Baru (Simpan Manual)
Menyimpan kredensial Kunci API SMM baru berdasarkan inputan pengguna secara manual (bukan generate otomatis).

* **Endpoint**: `/data-apikey`
* **Metode**: `POST`
* **Headers**:
  * `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "id_user": "uuid_pengguna_pemilik_key",
    "name": "Label Nama Kunci API",
    "api_key": "smm_live_8f3c7a...",        // Wajib diisi
    "url": "https://api.smmhub.com",        // Wajib diisi
    "secret_key": "secret_key_dari_panel",  // Opsional (disimpan null jika kosong)
    "api_id": "api_id_dari_panel",          // Opsional (disimpan null jika kosong)
    "balance": 100.00,                      // Opsional (disimpan 0 jika kosong)
    "code": "SMM"                           // Opsional (Default: SMM)
  }
  ```
* **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "API Key created successfully.",
    "data": {
      "id": "d7480b2a-...",
      "id_user": "e8a946c1-...",
      "name": "Label Nama Kunci API",
      "api_key": "smm_live_8f3c7a...",
      "secret_key": "secret_key_dari_panel",
      "balance": 100.00,
      "status": "Active",
      "code": "SMM",
      "api_id": "api_id_dari_panel",
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
    "error": "Missing required fields (id_user, name, api_key, or url)."
  }
  ```

---

### 2.3 Mengedit Kunci API
Mengubah informasi parameter nama kunci, kode, api_key, api_id, secret_key, url, saldo, status keaktifan, atau melakukan sinkronisasi saldo otomatis dari provider panel SMM.

* **Endpoint**: `/data-apikey`
* **Metode**: `PUT`
* **Headers**:
  * `Content-Type: application/json`
* **Request Body** (Sertakan ID dan kolom yang ingin diperbarui, atau gunakan parameter `sync`):
  ```json
  {
    "id": "uuid_kunci_api",
    "name": "Nama Kunci Baru",     // Opsional
    "code": "SMM",                 // Opsional
    "api_key": "new_api_key_xxx",  // Opsional
    "api_id": "new_api_id_xxx",    // Opsional
    "secret_key": "new_secret_xxx",// Opsional
    "url": "https://newapi.com",   // Opsional
    "balance": 250.00,             // Opsional
    "status": "Inactive",          // Opsional ('Active' / 'Inactive' / 'Not-Active')
    "sync": true                   // Opsional. Jika diset true, saldo akan disinkronisasikan langsung dari API Provider URL.
  }
  ```
* **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "API Key updated successfully.",
    "data": {
      "id": "uuid_kunci_api",
      "name": "Nama Kunci Baru",
      "balance": 250.00,
      "status": "Not-Active",
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
    "message": "API Key deleted successfully."
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
