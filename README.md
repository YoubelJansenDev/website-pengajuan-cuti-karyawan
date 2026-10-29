# 📋 Website Pengajuan Cuti Karyawan (SaaS Multi-Tenant)

Aplikasi SaaS untuk manajemen cuti karyawan — banyak perusahaan bisa mendaftar dan datanya **terisolasi penuh** antar perusahaan. Dibuat untuk tugas mata kuliah **Software as a Service (SaaS)**.

## ✨ Fitur

- **Admin (HR):** daftar perusahaan, kelola karyawan (invite/hapus/atur jatah cuti), approve/reject pengajuan cuti
- **Karyawan:** lihat sisa jatah cuti, ajukan cuti, lihat riwayat & status pengajuan
- **Validasi otomatis:** total hari cuti dicek terhadap sisa jatah (termasuk yang masih pending); jatah berkurang otomatis saat disetujui

## 🔐 Isolasi Multi-Tenant (Konsep Utama)

Semua perusahaan berbagi satu database dengan kolom `tenant_id`. Setiap request membawa JWT yang berisi `tenantId`, dan **setiap query selalu difilter** oleh `tenantId` dari token — sehingga data perusahaan A tidak mungkin bocor ke perusahaan B.

```js
// Contoh: admin hanya melihat pengajuan cuti PERUSAHAANNYA
prisma.leaveRequest.findMany({
  where: { tenantId: req.user.tenantId }, // ← kunci isolasi data
});
```

Keamanan lain: password di-hash (bcrypt), RBAC 2 role (`admin`/`employee`) via middleware.

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 18, Vite, React Router, Axios, Context API |
| Backend | Node.js, Express.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (jsonwebtoken) + bcryptjs |

## 🚀 Cara Menjalankan

**Prasyarat:** Node.js v18+, PostgreSQL berjalan di port 5432.

**1. Backend:**
```bash
cd server
npm install
copy .env.example .env        # lalu edit: isi DATABASE_URL & JWT_SECRET
npx prisma migrate dev        # buat tabel di database
npm run dev                   # jalan di http://localhost:5000
```

**2. Buat database dulu** (jika belum): `CREATE DATABASE saas_leave;` via pgAdmin/psql.

**3. Frontend:**
```bash
cd client
npm install
npm run dev                   # buka http://localhost:5173
```
Frontend otomatis terhubung ke backend lewat proxy Vite (`/api` → `localhost:5000`).

## 📖 Alur Penggunaan

1. HR mendaftarkan perusahaan → otomatis login sebagai admin
2. Admin membuat akun karyawan (beserta jatah cuti)
3. Karyawan login → mengajukan cuti
4. Admin approve/reject di dashboard
5. Jatah cuti karyawan berkurang otomatis saat disetujui

## 🔌 API Utama

| Method | Endpoint | Role | Fungsi |
|---|---|---|---|
| POST | `/api/auth/register-company` | Publik | Daftar perusahaan + admin |
| POST | `/api/auth/login` | Publik | Login |
| GET | `/api/users` | Admin | Daftar karyawan |
| POST | `/api/users/invite` | Admin | Tambah karyawan |
| POST | `/api/leaves` | Karyawan | Ajukan cuti |
| GET | `/api/leaves` | Admin | Semua pengajuan |
| PATCH | `/api/leaves/:id/approve` | Admin | Setujui |
| PATCH | `/api/leaves/:id/reject` | Admin | Tolak |

> Daftar lengkap endpoint lain ada di `server/src/routes/`.

## ⚠️ Catatan

- File `.env` tidak di-push ke GitHub (sudah di-cover `.gitignore`) — jangan commit kredensial
- Ubah skema database? Edit `server/prisma/schema.prisma` lalu jalankan `npx prisma migrate dev --name <perubahan>`

## 👨‍💻 Author

**Youbel Jansen** — [GitHub](https://github.com/YoubelJansenDev)
