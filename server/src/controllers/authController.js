const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

function signToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, tenantId: user.tenantId },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

function sanitize(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// POST /api/auth/register-company
async function registerCompany(req, res, next) {
  try {
    const { companyName, plan = 'free', adminName, email, password } = req.body;

    if (!companyName || !adminName || !email || !password) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    const company = await prisma.company.create({
      data: { name: companyName, subscriptionPlan: plan },
    });

    const existing = await prisma.user.findFirst({
      where: { tenantId: company.id, email: email.toLowerCase() },
    });
    if (existing) {
      await prisma.company.delete({ where: { id: company.id } });
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    const admin = await prisma.user.create({
      data: {
        tenantId: company.id,
        name: adminName,
        email: email.toLowerCase(),
        passwordHash: await bcrypt.hash(password, 10),
        role: 'admin',
        leaveBalance: 12,
      },
    });

    res.status(201).json({ token: signToken(admin), user: sanitize(admin), company });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
      include: { company: true },
    });
    if (!user) return res.status(401).json({ message: 'Email atau password salah' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Email atau password salah' });

    res.json({ token: signToken(user), user: sanitize(user), company: user.company });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function me(req, res, next) {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.user.userId, tenantId: req.user.tenantId },
      include: { company: true },
    });
    if (!user) return res.status(404).json({ message: 'Data tidak ditemukan' });
    res.json({ user: sanitize(user), company: user.company });
  } catch (err) {
    next(err);
  }
}

module.exports = { registerCompany, login, me };

