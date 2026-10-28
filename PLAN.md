# SaaS Sistem Manajemen Cuti Karyawan (B2B)

Aplikasi web multi-tenant sederhana untuk mengelola jatah & pengajuan cuti karyawan.
Monolith: **Express.js (backend API)** + **React/Vite (frontend)** + **MongoDB Atlas**.

## Struktur Project

```
SaaSWebsite/
├── server/                  # Backend Node.js + Express (JS murni)
│   ├── src/
│   │   ├── app.js           # Inisialisasi Express, middleware global
│   │   ├── server.js        # Entry point (jalankan server + koneksi MongoDB)
│   │   ├── config/
│   │   │   └── db.js        # Koneksi MongoDB Atlas (Mongoose)
│   │   ├── models/
│   │   │   ├── Company.js   # { name, subscriptionPlan, createdAt }
│   │   │   ├── User.js      # { tenantId, name, email, passwordHash, role, leaveBalance }
│   │   │   └── LeaveRequest.js # { tenantId, userId, startDate, endDate, reason, status, reviewedBy }
│   │   ├── middleware/
│   │   │   ├── auth.js      # Verifikasi JWT → req.user = { userId, role, tenantId }
│   │   │   └── role.js      # RBAC: requireRole('admin') / requireRole('employee')
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── companyController.js
│   │   │   ├── userController.js
│   │   │   └── leaveController.js
│   │   └── routes/
│   │       ├── authRoutes.js
│   │       ├── companyRoutes.js
│   │       ├── userRoutes.js
│   │       └── leaveRoutes.js
│   ├── .env.example
│   └── package.json
├── client/                  # Frontend React + Vite (JS murni)
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── api/axios.js     # Instance axios + interceptor token
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Global state: token, user, tenantId, role, company
│   │   ├── components/      # Layout, Sidebar, Header, dsb.
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── RegisterCompany.jsx   # Pendaftaran perusahaan baru (owner → admin)
│   │       ├── admin/
│   │       │   ├── Dashboard.jsx     # Semua pengajuan cuti perusahaan
│   │       │   ├── Employees.jsx     # Invite/kelola karyawan
│   │       │   └── ... 
│   │       └── employee/
│   │           ├── MyLeave.jsx       # Sisa jatah + status pengajuan
│   │           └── ApplyLeave.jsx    # Form pengajuan cuti
│   └── package.json
└── PLAN.md
```

## Rencana Implementasi (Urutan Kerja)

### Fase 1 — Backend
1. `npm init` server, install: express, mongoose, jsonwebtoken, bcryptjs, dotenv, cors
2. Model Company, User, LeaveRequest (semua bertenant kecuali Company)
3. Middleware `auth` (JWT) & `role` (RBAC)
4. Routes & controllers:
   - **Auth:** `POST /api/auth/register-company` (buat company + admin pertama), `POST /api/auth/login`, `GET /api/auth/me`
   - **Users (admin):** `POST /api/users/invite` (buat akun karyawan), `GET /api/users` (list karyawan perusahaan)
   - **Leave:**
     - Employee: `POST /api/leaves` (ajukan), `GET /api/leaves/mine`
     - Admin: `GET /api/leaves` (semua di tenant), `PATCH /api/leaves/:id/approve`, `PATCH /api/leaves/:id/reject`
5. **Aturan emas:** setiap query Mongoose selalu menyertakan `tenantId` dari `req.user.tenantId`.

### Fase 2 — Frontend
1. `npm create vite@latest client` (React, JS)
2. AuthContext (login/logout, simpan token di localStorage, decode profil)
3. Halaman Login & RegisterCompany
4. Layout: Sidebar + Header (nama & "logo" perusahaan, menu sesuai role)
5. Halaman admin (dashboard cuti, kelola karyawan, approve/reject)
6. Halaman employee (sisa jatah, ajukan cuti, riwayat status)

### Fase 3 — Pengujian & Polish
- Test alur: register company → login admin → invite karyawan → karyawan login → ajukan cuti → admin approve → jatah berkurang
- Pastikan tidak ada endpoint yang bisa mengambil data lintas tenant

## Konvensi Penting
- Bahasa: JavaScript murni (CommonJS di server, ESM di client Vite)
- Jatah cuti default karyawan baru: 12 hari/tahun (dapat diubah saat invite)
- Status pengajuan: `pending` → `approved` / `rejected`
- Approve cuti otomatis mengurangi `leaveBalance` karyawan (validasi sisa jatah saat pengajuan)

## Cara Menjalankan (setelah dibuat)
```bash
# Server
cd server
cp .env.example .env   # isi MONGO_URI, JWT_SECRET, PORT
npm install
npm run dev

# Client
cd client
npm install
npm run dev
```
