const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

function sanitize(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// GET /api/users — daftar karyawan perusahaan (admin saja)
// SELALU filter tenantId
async function listUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      where: { tenantId: req.user.tenantId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users: users.map(sanitize) });
  } catch (err) {
    next(err);
  }
}

// POST /api/users/invite — admin membuat akun karyawan baru
async function inviteUser(req, res, next) {
  try {
    const { name, email, password, leaveBalance } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    const existing = await prisma.user.findFirst({
      where: { tenantId: req.user.tenantId, email: email.toLowerCase() },
    });
    if (existing) {
      return res.status(409).json({ message: 'Email sudah terdaftar di perusahaan ini' });
    }

    const user = await prisma.user.create({
      data: {
        tenantId: req.user.tenantId, // WAJIB dari token, bukan dari body
        name,
        email: email.toLowerCase(),
        passwordHash: await bcrypt.hash(password, 10),
        role: 'employee',
        leaveBalance: Number(leaveBalance) > 0 ? Number(leaveBalance) : 12,
      },
    });

    res.status(201).json({ user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/:id/balance — admin ubah jatah cuti karyawan
async function updateBalance(req, res, next) {
  try {
    const { leaveBalance } = req.body;
    if (leaveBalance === undefined || leaveBalance < 0) {
      return res.status(400).json({ message: 'Jatah cuti tidak valid' });
    }

    // SELALU filter tenantId
    const user = await prisma.user.updateMany({
      where: { id: Number(req.params.id), tenantId: req.user.tenantId },
      data: { leaveBalance: Number(leaveBalance) },
    });
    if (user.count === 0) return res.status(404).json({ message: 'Karyawan tidak ditemukan' });

    const updated = await prisma.user.findFirst({
      where: { id: Number(req.params.id), tenantId: req.user.tenantId },
    });
    res.json({ user: sanitize(updated) });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/users/:id — admin hapus karyawan
async function deleteUser(req, res, next) {
  try {
    const result = await prisma.user.deleteMany({
      where: { id: Number(req.params.id), tenantId: req.user.tenantId },
    });
    if (result.count === 0) return res.status(404).json({ message: 'Karyawan tidak ditemukan' });
    res.json({ message: 'Karyawan dihapus' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, inviteUser, updateBalance, deleteUser };

